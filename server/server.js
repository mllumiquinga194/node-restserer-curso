const mongoose = require('mongoose');
const express = require('express');
require('./config/config'); //para configurar el puerto

const app = express();
app.use(require('./routes/usuario'));


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