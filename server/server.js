const express = require('express');
var bodyParser = require('body-parser');
require('./config/config'); //para configurar el puerto
const app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
 
app.get('/', function (req, res) {
  res.json('MI AMOR, TE AMO');
});
 
app.listen(PORT, () => { //la variable PORT viene del require('./config/config');
    console.log('Escuchando puerto: ', PORT);
    
});