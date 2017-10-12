require('dotenv').config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

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

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id] || 'Invalid URL!' };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let POSTrequest = req.body.longURL;
  console.log(POSTrequest);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
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



