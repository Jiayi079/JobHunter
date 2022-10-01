const express = require('express')
const router = express.Router()
const path = require('path')

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
  });

  router.get('/things/search', function(req, res) {
    console.log("success")
  })
module.exports = router;
