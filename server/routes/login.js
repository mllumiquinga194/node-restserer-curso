const express = require('express');
const Usuario = require('../models/usuario');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email.toLowerCase() }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error en la peticion',
                err
            });
        } else {
            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: '(Usuario) o Contraseña Incorrecto'
                    }
                });
            } else {
                if (!bcrypt.compareSync(body.password, usuarioDB.password)) {//si las contraseñas no son iguales
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Usuario o (Contraseña) Incorrecto'
                        }
                    });
                } else {
                    //aqui estoy creando el payload. el payload es todo el usuario de la base de datos
                    //el token lo creo con los datos que yo deseo codificar, la semilla y una fecha de expiracion
                    let token = jwt.sign({
                        usuario: usuarioDB
                    }, process.env.SEED,
                    { 
                        expiresIn: process.env.CADUCIDAD_TOKEN
                    });

                    return res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token
                    });
                }
            }
        }
    });
});

module.exports = app;