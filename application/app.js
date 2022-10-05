const express = require('express')
const app = express()
const path = require('path')
const port = 3000
const mysql = require('mysql')
const { nextTick } = require('process')

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
  var searchVal = req.query.search
  var category = req.query.category
  var sqlSearchVal = '%' + searchVal + '%'
  var query = 'SELECT * From Posting';
  if(searchVal != '' && category != '') {
    query = "SELECT * FROM Posting WHERE Category = ? AND ( Name LIKE ?  OR Comment LIKE ?)";
    database.query(query, [category, sqlSearchVal, sqlSearchVal], (err, result) => {
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

app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');

app.use(express.static('application'))
app.use('css', express.static(__dirname, + 'application/css'))
app.use('css', express.static(__dirname, + 'application/memberPages'))

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