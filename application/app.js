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


// Route handler that sends the response

app.get('/', search, (req, res) => {
  res.render('pages/index')
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