const express = require('express');
const fs = require('fs');
const path = require('path');
const {verificaTokenImg} = require('../middlewares/authentication');

let app = express();


app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if(fs.existsSync(pathImagen)){

        res.sendFile(pathImagen);
    }else{

        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg'); //para especificar la ruta compelta
        //esto es para retornar una imagen por defecto en caso que no se reciba ninguna
        res.sendFile(noImagePath);// con sendFile() debo especificar la ruta completa
    }
});

module.exports = app;