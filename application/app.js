const express = require('express')
const app = express()
const path = require('path')
const port = 3000
const mysql = require('mysql')
const { nextTick } = require('process')

const postListng = [
  {
    company: 'Google',
    jobName: 'SWE'
  },
  {
    company: 'Uber',
    jobName: 'AI'
  }
]

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
}
// Route handler that sends the response
app.get('/', function(req, res){
  res.render('pages/index')
});

app.get('/jobs', (req, res) => {
  res.send(postListng)
})

app.post('/jobs', (req, res) => {
  console.log(req.body)
  postListng.push(req.body)
  res.send(201)
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})