const express = require('express')
const app = express()
const path = require('path')
const port = 3000
const things = require('./things')
const mysql = require('mysql')
const { nextTick } = require('process')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Root@123',
  database: 'sys'
})



connection.connect()


app.use(express.static('application'))
app.use('css', express.static(__dirname, + 'application/css'))
app.use('css', express.static(__dirname, + 'application/memberPages'))


//Middleware function to log request protocol
app.use('/things', function(req, res, next){
  console.log("A request for things received at " + Date.now());
  next();
});

// Route handler that sends the response
app.get('/things', function(req, res, next){
  res.send('Things');
});

app.get('/things/search', function(req, res) {
  console.log("success")
})
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})