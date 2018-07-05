const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
require('./config/config'); //para configurar el puerto

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));//parse Application/x-www-from-urlencoded
app.use(bodyParser.json());// parse application/json

//configuracion Global de Rutas!
app.use(require('./routes/index'));


mongoose.Promise = global.Promise;
mongoose.connect(process.env.URLDB, (err, res) => {
  if (err) throw err;
  else {
    console.log("la conexion a la base de datos esta funcionando correctamente...");

    app.listen(PORT, () => {
      console.log("Servidor escuchando en http://localhost: " + PORT);

    });
  }
});

// app.listen(PORT, () => { //la variable PORT viene del require('./config/config');
//   console.log('Escuchando puerto: ', PORT);

// });