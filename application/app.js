
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
    if (userFound.length == 0) {
      console.log("Sanity")
      done(null, false, { message: 'No user with that email'})
    }
    else if ( userFound[0] && password == userFound[0].password) {
      console.log("Success")
      user = {id:userFound[0].id, email:userFound[0].email}
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
app.use(express.static('application/views'))
app.use('css', express.static(__dirname, + 'application/memberPages'))
app.use('css', express.static(__dirname, + 'application/views'))
app.use(cookiePrser());
app.use(express.json())
app.use(express.urlencoded())
app.use(passport.initialize())
app.use(passport.session())


// Route handler that sends the response
function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect('./')
  }
}

function hasMessage(req, res, next) {
  if (req.user) {
    if (req.user.message.length > 0) {
      next()
    } else {
      res.redirect('./')
    }
  } else {
    res.redirect('./')
  }
}

function isCompany(req, res, next) {
  if (req.user) {
    if (req.user.isCompany == 1) {
      next()
    } else {
      res.redirect('./')
    }
  } else {
    res.redirect('./')
  }
}

function isAdmin(req, res, next) {
  if (req.user) {
    if (req.isAuthenticated && req.user.isAdmin == 1) {
      next()
    } else {
      res.redirect('./')
    }
  } else {
    res.redirect('./')
  }
}
app.get('/', search, (req, res) => {
  res.render('pages/index', {
    results: req.searchResult.length,
    searchVal: req.searchVal,
    searchResult: req.searchResult,
    category: req.category,
    isLogged: req.isAuthenticated(),
    isCompany: req.user ? req.user.isCompany : 0,
  })
  console.log(req.searchResult);
  console.log(req.user)
})


app.get('/register', (req, res) => {
  res.render('pages/register', {
    isLogged: req.isAuthenticated(),
    isCompany: req.user ? req.user.isCompany : 0
  });
})

app.get('/login', (req, res) => {
  res.render('pages/login', {
    isLogged: req.isAuthenticated(),
    isCompany: req.user ? req.user.isCompany : 0
  });
})

app.get('/post', isCompany, (req, res) => {
  res.render('pages/post', {
    isLogged: req.isAuthenticated(),
    isCompany: req.user ? req.user.isCompany : 0
  });
})

app.get('/profile', (req, res) => {
  res.render('pages/profile', {
    isLogged: req.isAuthenticated(),
    isCompany: req.user ? req.user.isCompany : 0
  })
})
// Login authentication

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

// Register new user

app.post('/deleteMessage', isAuth, function(req, res) {

  var sql = "UPDATE userData SET message = null WHERE id = ?"

  database.query(sql, [req.user.id], function(err, results) {
    if (err) {
      return err
    }
    console.log("message deleted for user ", req.user.id)
    res.redirect('/')
  })
})

app.post('/createMessage', isAdmin, function(req, res) {
  var message = req.body.message
  var id = req.body.userID
  var sql = "UPDATE userData SET message = ? WHERE id = ?"

  database.query(sql, [message, id], function(err, results) {
    if (err) {
      return res.send(err)
    }
    console.log("message added for ", req.user.id)
    res.redirect('/')
  })
})

app.post('/register',function(req,res){

  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var isCompany = req.body.isCompany;

  var sql = "INSERT INTO userData (username,password,email, isCompany) VALUES ('"+username+"', '"+password+"', '"+email+"', '"+isCompany+"')";
  database.query(sql, function (err, result) {
    if (err) {
      return res.send(err);
    }
    console.log("1 user inserted");
    res.redirect('/login')  ;
  });
  
  });

app.get('/users', isAdmin, function(req, res) {
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
  res.render('pages/about', {
    isLogged: req.isAuthenticated(),
    isCompany: req.user ? req.user.isCompany : 0
  });
})

app.get('/admin', isAdmin, (req, res) => {
  res.render('pages/admin', {
    isLogged: req.isAuthenticated(),
    isCompany: req.user ? req.user.isCompany : 0
  })
})
app.get('/link', (req, res) => {
  res.render('pages/link', {
    isLogged: req.isAuthenticated(),
    isCompany: req.user ? req.user.isCompany : 0
  })
})

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get('/notifications', isAuth, (req, res) => {
  res.render('pages/notifications', {
    isLogged: req.isAuthenticated(),
    isCompany: req.user ? req.user.isCompany : 0,
    message: req.user ? req.user.message : null
  })
})

app.all('/session-flash', function( req, res ) {
  req.session.sessionFlash = {
      type: 'success',
      message: 'This is a flash message using custom middleware and express-session.'
  }
  res.redirect(301, '/');
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})