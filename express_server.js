// Setup environment and libraries:
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name:"session",
  keys: ["user_id"]
}));


// Define global variables to save and retrieve data:
const urlDatabase = {
  "b2xVn2": {
    fullURL: "http://www.lighthouselabs.ca",
    userID: "josh"
  },
  "9sm5xK": {
    fullURL: "http://www.google.com",
    userID: "josh"
  },
  "abcdef": {
    fullURL: "http://www.youtube.com",
    userID: "user1"
  },
  "123456": {
    fullURL: "http://facebook.com",
    userID: "test"
  }
};

const users = {
  "user1": {
    id: "user1",
    email: "user1@gmail.com",
    password: `${bcrypt.hashSync("user", 10)}`
  },
 "user2": {
    id: "user2",
    email: "user2@gmail.com",
    password: `${bcrypt.hashSync("user2", 10)}`
  },
  "josh": {
    id: "josh",
    email: "josh@gmail.com",
    password: `${bcrypt.hashSync("josh", 10)}`
  },
  "test": {
    id: "test",
    email: "test@gmail.com",
    password: `${bcrypt.hashSync("test", 10)}`
  }
};


// Function: generate 6 random alphanumeric characters:
function generateRandomString() {
  let text = '';
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let len = possible.length;
  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * len));
  }
  return text;
}

// Function: retrieve URLs from database for an input user:
function urlsForUser(inputUser) {
  let urlsResult = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key]["userID"] === inputUser.id) {
      urlsResult[key] = urlDatabase[key]["fullURL"];
    }
  }
  return urlsResult;
}

//// Adding Routes -- GET:
app.get("/", (req, res) => {
  if (users[req.session.user_id]) {                 //if user is logged in
    res.redirect("/urls");
  } else {                                          //if user is not logged in
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  let user = users[req.session.user_id] || 0;
  if (user) {
    let templateVars = { urls: urlsForUser(user), PORT: PORT, user: user };
    res.render("urls_index", templateVars);
  } else {
    res.end("<html><body><b>ERROR: You are not logged in!</b></body></html>\n");
  }
});

app.get("/urls/new", (req, res) => {
  let user = users[req.session.user_id] || 0;
  if (user) {
    res.render("urls_new", { user: user });
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  let URLexistCheck = urlDatabase[req.params.id] || 0;    //check if a URL exist
  if (URLexistCheck === 0) {
    res.end("<html><body><b>ERROR: This short URL does not exist!</b></body></html>\n");
    return ;
  }

  let userCheck = users[req.session.user_id] || 0;        //check if the user is logged in
  if (userCheck) {
    let longURLCheck = urlDatabase[req.params.id]["fullURL"] || 0;
    if (longURLCheck) {                                   //if the user is logged in, check if the long URL is matched to the user
      if(userCheck.id == urlDatabase[req.params.id]["userID"]) {
        let templateVars = {shortURL: req.params.id, longURL: longURLCheck, user: userCheck };
        res.render("urls_show", templateVars);
      } else {
        res.end("<html><body><b>ERROR:You are logged in, but you don't own the URL!</b></body></html>\n");
      }
    }
  } else {
    res.end("<html><body><b>ERROR: You are not logged in!</b></body></html>\n");
  }
});

app.get("/u/:id", (req, res) => {
  let shortURLCheck = urlDatabase[req.params.id] || 0;      //check if the short URL exist
  if (shortURLCheck) {
    res.redirect(shortURLCheck["fullURL"]);
  } else {
    res.end("<html><body><b>ERROR: The short URL does not exist!</b></body></html>\n");
  }
});

app.get("/login", (req, res) => {
  let user = users[req.session.user_id] || 0;
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login", { user: user });
  }
});

app.get("/register", (req, res) => {
  let user = users[req.session.user_id] || 0;
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", { user: user });
  }
});


//// Adding Routes -- POST:
app.post("/urls", (req, res) => {
  let POSTrequest = req.body.longURL;
  let tempShort = generateRandomString();
  urlDatabase[tempShort] = { fullURL: POSTrequest, userID: req.session.user_id };
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id]["fullURL"] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let curEmail = req.body.email;
  let curPassword = req.body.password;

  for (let key in users) {
    if (users[key]["email"] === curEmail) {                           //check if the emails are matched
      if (bcrypt.compareSync(curPassword, users[key]["password"])) {  //check if the input password is matched with the encrypted password
        req.session.user_id = key;                                    //set a cookie
        res.redirect("/urls");
        return ;
      } else {
        res.status(403).send("Password did not match!");
        return ;
      }
    }
  }
  res.status(403).send("Email address Not Found!");
});

app.post("/register", (req, res) => {
  let tempEmail = req.body.email;
  let tempPassword = req.body.password;
  let hashedPassword = bcrypt.hashSync(tempPassword, 10);
  let emailList = [];                                                           //create a list to retrieve all email addresses, in order to check if an input email already exists
  for (let key in users) {
    emailList.push(users[key]["email"]);
  }

  if (tempEmail === '' || tempPassword === '') {
    res.status(400).send("Email or Password could not be empty!");
    return ;
  } else if (emailList.indexOf(tempEmail) != -1) {                              //check if the input email already exists
    res.status(400).send("Sorry, the email address has been used!");
    return ;
  } else {
    let tempId = generateRandomString();
    users[tempId] = { id: tempId, email: tempEmail, password: hashedPassword }; //creates a new user
    req.session.user_id = tempId;                                               //set a cookie
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});



