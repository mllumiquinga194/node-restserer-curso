const express = require('express');
const Usuario = require('../models/usuario');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');//libreria de google para hacer inicio de sesion con google
const client = new OAuth2Client(process.env.CLIENT_ID); //client ID de google project

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email.toLowerCase() }, (err, usuarioDB) => {//para hacer login pregunto por el email ya que es unico para cada usuario
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
            } else {//en este punto el usuario debe estar en la base de datos por eso pregunto por su contraseña
                if (!bcrypt.compareSync(body.password, usuarioDB.password)) {//si las contraseñas no son iguales
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Usuario o (Contraseña) Incorrecto'
                        }
                    });
                } else {//si todo va bien, creo el token y devuelvo el usuario logeado mas el token
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

//Configuraciones de google

async function verify(token) {//esta funcion me verifia si el token generado por google es correcto y me devuelve el payload
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

    //estos log no son en el navegador sino en el servidor.
    // console.log(payload.name);
    // console.log(payload.email);
    // console.log(payload.picture);


}
//como la funcion verify es una promesa, yo puedo usar su resultado con un await pero para eso existe la regla de que para usar await debo estar en una funcion async por eso hago estas modificaciones 
app.post('/google', async (req, res) => {
    let token = req.body.idtoken;//recibo el token enviado desde la carpeta publica, archivo index.html

    let googleUser = await verify(token)// llamo a la funcion verify para saber si mi token es valido. esta es una funcion de google
        .catch(e => {
            return res.status(500).json({
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {//busco si el correo de esa persona ya esta en la base de datos, lo que no me permitiria agregarlo ya que el correo debe ser unico
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else {

            if (usuarioDB) {

                if (usuarioDB.google === false) {//si el usuario no fue creado con google, no debe ser permitido que inicie sesion con google, por lo tanto aqui se pide que use su autenticacion normal.
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'debe usar su autenticacion normal'
                        }
                    });
                } else { //si el usuario fue creado mediante google y esta iniciando sesion con google, entonces se le actualiza el token para que pueda seguir trabajando
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
            } else {//si el usuario no existe en nuestra base de datos
                
                let usuario = new Usuario();

                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = true;
                usuario.password = ':)'; //como este usuario viene iniciando sesion desde google y google no envia la clave, se le asigna una solo porque en el modelo de usuario la clave es requerida. el usuario no podra hacer login con esa carita feliz por la encriptacion de 10 vueltas que se le da a la password

                usuario.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }
                    
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
                });
            }
        }

    });
});

module.exports = app;