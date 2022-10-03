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


app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');

app.use(express.static('application'))
app.use('css', express.static(__dirname, + 'application/css'))
app.use('css', express.static(__dirname, + 'application/memberPages'))

app.use(express.json())
app.use(express.urlencoded())

function search(req, res, next) {
  var searchTerm = req.query.search;

  var category = req.query.catagory;

  let query = 'SELECT * FROM Posting';
  if (searchTerm != '' && category != '') {
    query = `SELECT * FROM Posting WHERE Category = '` + category + `' AND (Name LIKE '%` + searchTerm + `%' OR Comment LIKE '%` + searchTerm + `%')`;
  } else if(searchTerm != '' && category == '') {
    query = `SELECT * FROM Posting WHERE Name LIKE '%` + searchTerm + `%' OR Comment LIKE '%` + searchTerm + `%'`;
  } else if(searchTerm == '' && category != '') {
    query = `SELECT * FROM Posting WHERE Category = '` + category + `'`;
  }
  database.query(query, (err, result) => {
    if(err) {
      req.searchResult = "";
      req.searchTerm = "";
      req.category = "";
      next()
    }

    req.searchResult = result;
    req.searchTerm = searchTerm;
    req.category = "";

    next();
  });
}
// Route handler that sends the response


app.get('/', search, (req, res) => {
  var searchResult = req.searchResult;
  res.render('pages/index', {
    results: searchResult.length,
    searchTerm: req.searchTerm,
    searchResult: searchResult,
    category: req.category
  });
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