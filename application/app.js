
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
const session = require('express-session')
const flash = require('express-flash')
const MySQLStore = require('express-mysql-session')(session)
const cookiePrser = require('cookie-parser')
const crypto = require('crypto');

const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Root@123',
  database: 'mysql',
});

database.connect((err) => {
  if (err) throw err;
  console.log('Connected');
  database.query('Use job');
})

const query1 = "SELECT * From userData WHERE email = ?"
function search(req, res, next) {
  var searchVal = req.query.search == undefined ? '' : req.query.search.trim();
  console.log(searchVal)
  var category = req.query.category
  var sqlSearchVal = '%' + searchVal + '%'
  var query = 'SELECT * From Posting';
  if(searchVal != '' && category != '') {
    query = "SELECT * FROM Posting WHERE Category = ? AND ( Name LIKE ?  OR Category LIKE ?)";
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
    query = "SELECT * FROM Posting WHERE Name LIKE ? OR Category LIKE ?";
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

passport.serializeUser(function(user, done) {
  console.log("inside serialize")
  done(null, user.id);
});

passport.deserializeUser(function(userId, done) {
  console.log("deseriealize user" + userId)
  database.query('SELECT * FROM userData where id = ?',[userId], function(err, results) {
    if (err) return done(err)
    if (results[0]) {
      console.log(results[0])
      return done(null, results[0])
    } else {
      return done(null, false)
    }
    
  });
});

query1Promise = (email) => {
  return new Promise((resolve, reject) => {
    database.query(query1, [email] , (err, results) => {
      if (err) {
        return reject(err)
      }
      return resolve(results)
    })
  })
}

app.use(flash())
app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  store: new MySQLStore({
    host: 'localhost',
    user: 'root',
    password: 'Root@123',
    database: 'job'
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge:1000*60*60*24,
  }
}))

// Login authentication

passport.use(new passportLocal.Strategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const userFound = await query1Promise(email)
    console.log(userFound);
    user = {id:userFound[0].id, email:userFound[0].email}
    if (userFound.length == 0) {
      console.log("Sanity")
      done(null, false, { message: 'No user with that email'})
    }
    else if ( userFound[0] && password == userFound[0].password) {
      console.log("Success")
      done(null,user)
    } else {
      done(null, false, { message: 'Password incorrect'})
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
app.use('css', express.static(__dirname, + 'application/views/css'))
app.use(cookiePrser());
app.use(express.json())
app.use(express.urlencoded())
app.use(passport.initialize())
app.use(passport.session())


// Route handler that sends the response

app.get('/', search, (req, res) => {
  res.render('pages/index', {
    results: req.searchResult.length,
    searchVal: req.searchVal,
    searchResult: req.searchResult,
    category: req.category,
  })
  console.log(req.searchResult);
  console.log(req.user); 
})


app.get('/register', (req, res) => {
  res.render('pages/register');
})

app.get('/login', (req, res) => {
  res.render('pages/login');
})

app.get('/post', (req, res) => {
  res.render('pages/post');
})

// Login authentication

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

// Register new user 

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
    res.redirect('/login')  ;
  });
  
  });

app.get('/users', function(req, res) {
  var query = "SELECT * From userData"

  database.query(query, function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

// Create new post 

app.post('/post',function(req,res){

  var name = req.body.name;
  var location = req.body.location;
  var companyname = req.body.companyname;
  var salary = req.body.salary;
  var comment = req.body.comment

  var sql = "INSERT INTO Posting (name,location,companyname,salary,description) VALUES ('"+name+"', '"+location+"', '"+companyname+"','"+salary+"','"+comment+"')";
  database.query(sql, function (err, result) {
    if (err) {
      return res.send(err);
    }
    console.log("1 post inserted");
    res.redirect('/')  ;
  });
  
  });
app.get('/about', (req, res) => {
  res.render('pages/about');
})



app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})