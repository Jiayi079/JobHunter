const express = require('express')
const app = express()
const path = require('path')
const port = 3000

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




app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})