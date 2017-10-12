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

// global objects to save data:
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "jojosh": {
    id: "jojosh",
    email: "jojosh@mail.com",
    password: "pwddd"
  }
};

//GET
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       PORT: PORT,
                       username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id] || 'Invalid URL!',
                       username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



//Thursday code
app.get("/register", (req, res) => {
  res.render("register", { username: req.cookies["username"]});
});







//POST
app.post("/urls", (req, res) => {
  let POSTrequest = req.body.longURL;
  console.log(POSTrequest);  // debug statement to see POST parameters
  let tempShort = generateRandomString();
  urlDatabase[tempShort] = POSTrequest;
  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id]=req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('urls');
});


app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});



//Thursday code
app.post("/register", (req, res) => {
  let tempEmail = req.body.email;
  let tempPassword = req.body.password;
  let tempId = generateRandomString();
  users[tempId] = {id: tempId, email: tempEmail, password: tempPassword};
  res.cookie("user_id", tempId);
  console.log(users);

  res.redirect("/urls");
})




app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



