const express = require('express')
const app = express()
const path = require('path')
const port = 3000
const mysql = require('mysql')
const { nextTick } = require('process')
const { data } = require('jquery')

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


// create post (everything but description)
app.post('/post',function(req,res){

  var name = req.body.name;
  var location = req.body.location;
  var email = req.body.email;
  var companyname = req.body.companyname;
  var salary = req.body.salary;

  database.connect(function(err) {
  if (err) throw err;
  var sql = "INSERT INTO postData (name,location,email,companyname,salary) VALUES ('"+name+"', '"+location+"','"+email+"', '"+companyname+"', '"+salary+"')";
  data.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 job post inserted");
     res.end();
  });
  });
})

// create post (description)
app.post('/submit',function(req,res){

  var Comment = req.body.Comment;
  

  database.connect(function(err) {
  if (err) throw err;
  var sql = "INSERT INTO postData (Comment) VALUES ('"+Comment+"')";
  database.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 job desc inserted");
     res.end();
  });
  });
})

app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');

app.use(express.static('application'))
app.use('css', express.static(__dirname, + 'application/memberPages'))
app.use('css', express.static(__dirname, + 'application/css'))
app.use('css', express.static(__dirname, + 'application/views/pages'))

app.use(express.json())
app.use(express.urlencoded())


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

// create user 
app.post('/createAccount',function(req,res){

  var username = req.body.username;
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;

  var sql = "INSERT INTO userData (username,name,email,password) VALUES ('"+username+"', '"+name+"','"+email+"', '"+password+"')";
  database.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 user inserted");
    res.status(204).send()  ;
  });
  
  });


app.get('/jobs', (req, res) => {
  res.send(201)
})

app.post('/jobs', (req, res) => {
  console.log(req.body)
  postListng.push(req.body)
  res.send(201)
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})