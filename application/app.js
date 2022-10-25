const express = require('express')
const app = express()
const path = require('path')
const port = 3000
const mysql = require('mysql')
const { nextTick } = require('process')
const { data } = require('jquery')
const passport = require('passport')
const passportLocal = require('passport-local')
const { rejects } = require('assert')

const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Root@123',
  database: 'mysql'
});

database.connect((err) => {
  if (err) throw err;
  console.log('Connected');
  database.query('Use sys');
})

function search(req, res, next) {
  var searchVal = req.query.search == undefined ? '' : req.query.search.trim();
  console.log(searchVal)
  var category = req.query.category
  var sqlSearchVal = '%' + searchVal + '%'
  var query = 'SELECT * From Posting';
  if(searchVal != '' && category != '') {
    query = "SELECT * FROM Posting WHERE Category = ? AND ( Name LIKE ?  OR Comment LIKE ?)";
    database.query(query, [category, sqlSearchVal, sqlSearchVal], (err, result) => {
      console.log(query)
      if (err) {
        req.searchResult = "";
        req.searchVal = "";
        req.category = "";
        next();
      }
  
      req.searchResult = result;
      req.searchVal = searchVal;
      req.category = "";
  
      next();
    })
  } else if(searchVal != '' && category == '') {
    query = "SELECT * FROM Posting WHERE Name LIKE ? OR Comment LIKE ?";
    database.query(query, [sqlSearchVal, sqlSearchVal], (err, result) => {
      console.log(query)
      if (err) {
        req.searchResult = "";
        req.searchVal = "";
        req.category = "";
        next();
      }
  
      req.searchResult = result;
      req.searchVal = searchVal;
      req.category = "";
  
      next();
    })
  } else if(searchVal == '' && category != '') {
    query = "SELECT * FROM Posting WHERE Category = ?"
    console.log(query)
    database.query(query, [category], (err, result) => {
      if (err) {
        req.searchResult = "";
        req.searchVal = "";
        req.category = "";
        next();
      }
  
      req.searchResult = result;
      req.searchVal = searchVal;
      req.category = "";
      
      next();
    })
  } else {
    query = "SELECT * FROM Posting"
    console.log(query)
    database.query(query, [category], (err, result) => {
      if (err) {
        req.searchResult = "";
        req.searchVal = "";
        req.category = "";
        next();
      }
  
      req.searchResult = result;
      req.searchVal = searchVal;
      req.category = "";
      
      next();
    })
  }
};


passport.use(new passportLocal.Strategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    var userFound = [];
    const query = "SELECT 1 From userData WHERE email = ?"
    database.query(query, [email], (err, result) => {
      if (err) {
        console.log(err)
      }
      Object.keys(result).forEach(function(key)) {
        var userFound = result[key]
      }
      console.log(userFound.email)
      console.log(userFound.password)
    })
    if ( userFound && password === userFound.password) {
      done(null,userFound)
    } else {
      done(null, false)
    }
  } catch(error) {
    done(error)
  }
}))
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');

app.use(express.static('application'))
app.use('css', express.static(__dirname, + 'application/memberPages'))
app.use('css', express.static(__dirname, + 'application/css'))
app.use('css', express.static(__dirname, + 'application/views/pages'))

app.use(express.json())
app.use(express.urlencoded())
app.use(passport.initialize())


// Route handler that sends the response

app.get('/', search, (req, res) => {
  res.render('pages/index', {
    results: req.searchResult.length,
    searchVal: req.searchVal,
    searchResult: req.searchResult,
    category: req.category
  })
  console.log(req.searchResult); 
})



app.get('/register', (req, res) => {
  res.render('pages/register');
})

app.get('/login', (req, res) => {
  res.render('pages/login');
})

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.redirect('/')
})
// create user 
app.post('/register',function(req,res){

  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

  var sql = "INSERT INTO userData (username,password,email) VALUES ('"+username+"', '"+password+"', '"+email+"')";
  database.query(sql, function (err, result) {
    if (err) {
      return res.send(err);
    }
    console.log("1 user inserted");
    res.status(204).send()  ;
  });
  
  });

app.get('/users', function(req, res) {
  var query = "SELECT * From userData"

  database.query(query, function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

app.get('/about', (req, res) => {
  res.render('pages/about');
})



app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})