var express = require('express');
var app = express();

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.render('index.html');
});

app.listen(8080);
console.log('Listening on port 80');