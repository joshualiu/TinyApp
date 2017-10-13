require('dotenv').config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const cookieParser = require('cookie-parser');
app.use(cookieParser());


//Generate 6 random alphanumeric characters
function generateRandomString() {
  let text = '';
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let length = possible.length;
  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * length));
  }
  return text;
}


//global objects to save data:
// let urlDatabase_old = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
//   "abcdef": "http://www.youtube.com",
//   "123456": "http://www.facebook.com"
// };

//update urldatabase -- urls belong to users


// let urlDatabase = {
//   "josh": [{"b2xVn2": "http://www.lighthouselabs.ca"},
//            {"9sm5xK": "http://www.google.com"}],
//   "user1": [{"abcdef": "http://www.youtube.com"}],
//   "test": [{"123456": "http://www.facebook.com"}]
// };


let urlDatabase = {
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


//

const users = {
  "user1": {
    id: "user1",
    email: "user1@gmail.com",
    password: "user1"
  },
 "user2": {
    id: "user2",
    email: "user2@gmail.com",
    password: "user2"
  },
  "josh": {
    id: "josh",
    email: "josh@gmail.com",
    password: "josh"
  },
  "test": {
    id: "test",
    email: "test@gmail.com",
    password: "test"
  }
};

//GET
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  //test code
  let user = users[req.cookies["user_id"]] || 0;
  let urlsObj = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key]['userID'] === user.id) {
      urlsObj[key] = urlDatabase[key]['fullURL'];
    }
  }

  let templateVars = { urls: urlsObj,
                       PORT: PORT,
                       user: users[req.cookies["user_id"]] || 0};
  res.render("urls_index", templateVars);
});

// app.get("/urls/new", (req, res) => {
//   let templateVars = { user: users[req.cookies["user_id"]]};
//   res.render("urls_new", templateVars);
// });


//only register and logged in users could access /urls/new
app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = { user: users[req.cookies["user_id"]] || 0};
    res.render("urls_new", templateVars);
    return ;
  } else {
    res.redirect('/login');
    return ;
  }
});


//

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id]['fullURL'],
                       user: users[req.cookies["user_id"]] || 0};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]['fullURL'];
  console.log(longURL)
 res.redirect(longURL);
});



//Thursday code
app.get("/register", (req, res) => {
  res.render("register", { user: users[req.cookies["user_id"]] || 0});
});

app.get("/login", (req, res) => {
  res.render("login", { user: users[req.cookies["user_id"]] || 0});
});





//POST
app.post("/urls", (req, res) => {
  let POSTrequest = req.body.longURL;
  console.log(POSTrequest);  // debug statement to see POST parameters
  let tempShort = generateRandomString();
  urlDatabase[tempShort] = { fullURL: POSTrequest, userID: req.cookies["user_id"]}
  // urlDatabase[tempShort] = POSTrequest;
  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id]['fullURL'] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let curEmail = req.body.email;
  let curPassword = req.body.password;

  for (let key in users) {
    if (users[key]['email'] === curEmail) {
      if (users[key]['password'] === curPassword) {
        res.cookie("user_id", key);
        res.redirect('/urls');
        return ;
      } else {
        res.status(403).send("Wrong Password!");
        return ;
      }
    }
  }
  res.status(403).send('Email address Not Found!');

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});



//Thursday code
app.post("/register", (req, res) => {
  let tempEmail = req.body.email;
  let tempPassword = req.body.password;
  let emailList = [];
  for (let key in users) {
    emailList.push(users[key]['email']);
  }
  if (tempEmail == '' || tempPassword == '') {
    res.status(400).send("Email or Password could not be empty :/");
  } else if (emailList.indexOf(tempEmail) != -1) {
    res.status(400).send("Sorry, the email address has been used :/");
  } else {
    let tempId = generateRandomString();
    users[tempId] = {id: tempId, email: tempEmail, password: tempPassword};
    res.cookie("user_id", tempId);
    console.log(req.cookies);
    res.redirect("/urls");
  }
});




app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



