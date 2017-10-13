require('dotenv').config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

const cookieSession = require('cookie-session')
app.set('trust proxy', 1);
app.use(cookieSession({
  name:'session',
  keys: ['user_id']
}));


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

//GET---------------

app.get("/", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


app.get("/urls", (req, res) => {
  let user = users[req.session.user_id] || 0;
  if (user) {
    let templateVars = { urls: urlsForUser(user),
                         PORT: PORT,
                         user: user};
    res.render("urls_index", templateVars);
  } else {
    res.end("<html><body>ERROR: You are not logged in!</body></html>\n");
  }
})

function urlsForUser(inputUser) {
  const urlsResult = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key]['userID'] === inputUser.id) {
      urlsResult[key] = urlDatabase[key]['fullURL'];
    }
  }
  return urlsResult;
}


// app.get("/urls", (req, res) => {
//   //test code
//   let user = users[req.cookies["user_id"]] || 0;
//   // let urlsObj = {};
//   // for (let key in urlDatabase) {
//   //   if (urlDatabase[key]['userID'] === user.id) {
//   //     urlsObj[key] = urlDatabase[key]['fullURL'];
//   //   }
//   // }

//   let templateVars = { urls: urlsForUser(user),
//                        PORT: PORT,
//                        user: user};
//   res.render("urls_index", templateVars);
// });






// app.get("/urls/new", (req, res) => {
//   let templateVars = { user: users[req.cookies["user_id"]]};
//   res.render("urls_new", templateVars);
// });


//only register and logged in users could access /urls/new
app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = { user: users[req.session.user_id] || 0};
    res.render("urls_new", templateVars);
    return ;
  } else {
    res.redirect('/login');
    return ;
  }
});


app.get("/urls/:id", (req, res) => {
  let userCheck = users[req.session.user_id] || 0;
  let URLexistCheck = urlDatabase[req.params.id] || 0;
  if (URLexistCheck === 0) {
    res.end("<html><body>ERROR: The shortURL does not exist!</body></html>\n");
    return;
  }

  if (userCheck) {
    let longURLCheck = urlDatabase[req.params.id]['fullURL'] || 0;
    if (longURLCheck) {
      if(userCheck.id == urlDatabase[req.params.id]['userID']) {
        console.log('user exist and logged in, short and long urls exist and match to the user!')
        let templateVars = {shortURL: req.params.id,
                            longURL: longURLCheck,
                            user: userCheck };
        res.render("urls_show", templateVars);
      } else {
        console.log('user exist and logged in, short and long urls exist but dont match to the user!')
        res.end("<html><body>ERROR:You are logged in, but you dont own the URL!</body></html>\n");
      }
    }
  } else {
    res.end("<html><body>ERROR: You are not logged in!</body></html>\n");
  }

});

app.get("/u/:id", (req, res) => {
  let longURLCheck = urlDatabase[req.params.id] || 0;
  if (longURLCheck) {
    res.redirect(longURLCheck['fullURL']);
  } else {
    res.end("<html><body>ERROR: The shortURL does not exist!</body></html>\n");
  }
});



app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect('/urls');
  } else {
    res.render("login", { user: users[req.session.user_id] || 0});
  }
});


app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect('/urls');
  } else {
    res.render("register", { user: users[req.session.user_id] || 0});
  }
});


//POST
app.post("/urls", (req, res) => {
  let POSTrequest = req.body.longURL;
  // console.log(POSTrequest);  // debug statement to see POST parameters
  let tempShort = generateRandomString();
  urlDatabase[tempShort] = { fullURL: POSTrequest, userID: req.session.user_id}
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
      if (bcrypt.compareSync(curPassword, users[key]['password'])) {
        req.session.user_id = key;
        // res.cookie("user_id", key);
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


app.post("/register", (req, res) => {
  let tempEmail = req.body.email;
  let tempPassword = req.body.password;
  let hashedPassword = bcrypt.hashSync(tempPassword, 10);
  let emailList = [];
  for (let key in users) {
    emailList.push(users[key]['email']);
  }
  if (tempEmail == '' || tempPassword == '') {
    res.status(400).send("Email or Password could not be empty :/");
    return ;
  } else if (emailList.indexOf(tempEmail) != -1) {
    res.status(400).send("Sorry, the email address has been used :/");
    return;
  } else {
    let tempId = generateRandomString();
    users[tempId] = {id: tempId, email: tempEmail, password: hashedPassword};
    req.session.user_id = tempId;
    // res.cookie("user_id", tempId);
    // console.log(req.cookies);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  // res.clearCookie("user_id");
  res.redirect('/login');
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



