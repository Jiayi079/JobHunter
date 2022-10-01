const express = require('express')
const app = express()
const path = require('path')
const port = 3000
const things = require('./things')
const mysql = require('mysql')

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


app.use('/things', things)

app.use('things/search', function(req, res) => {
  console.log("success")
})
app.use('')
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})