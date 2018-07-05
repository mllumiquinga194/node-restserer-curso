const express = require('express');
const Usuario = require('../models/usuario');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');

//importando usando la destructuracion
const { verificaToken, verificaAdmin_Role } = require('../middlewares/authentication');

app.get('/', function (req, res) {
    res.json('MI AMOR, TE AMO');
});

app.get('/usuario', verificaToken, function (req, res) { //verifica token no es una funtion, es el middleware directamente

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limtie = Number(limite);

    //en el find le mande como parametro que solo me busque los usuarios que tengan estados TRUE y lo mismo le indico para el conteo
    Usuario.find({estado: true}, 'nombre email img role estado google')//colocando este segundo parametro puedo decirle que campos especificamnte yo quiero que me muestre, si no quiero algun campo, simplemente lo dejo fuera
        .skip(desde)
        .limit(limtie)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            } else {
                Usuario.countDocuments({estado: true}, (err, conteo) => {
                    res.json({
                        ok: true,
                        usuarios,
                        conteo
                    });
                });
            }
        });
});

app.post('/usuario', [verificaToken, verificaAdmin_Role], function (req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), //numero de vueltas que quiero aplicarle a este hash
        role: body.role
    });

    usuario.save((err, usuarioDb) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        } else {

            // usuarioDb.password = null; //para que no me muestre la pass cuando devuelvo el usuario
            res.json({
                ok: true,
                usuario: usuarioDb
            });
        }
    });
});

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado',]);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDb) => { //{new: true} es una opcion que le mando para especificar que me devuelva el usuario actualizado y no es usuario sin actualizar
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        } else {
            res.json({
                ok: true,
                usuario: usuarioDb
            });
        }
    });

});

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {

    let id = req.params.id;

    //este es un borrado logico, que lo que hace es cambiar el estado a false para que no sea mostrado. ya las condiciones estan dadas para que cuando tenga el estado false, no me lo muestre (busque) ni me lo cuente!!
    let cambioEstado = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, cambioEstado, { new: true}, (err, usuarioDb) => { //{new: true} es una opcion que le mando para especificar que me devuelva el usuario actualizado y no es usuario sin actualizar
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        } else {
            if (!usuarioDb) {
                res.json({
                    ok: false,
                    message: 'No existe el usuario'
                });
            }else{
                res.json({
                    ok: true,
                    message: 'cambio de estado',
                    usuario: usuarioDb
                });
            }
        }
    });

    //este borrado es fisilo, la cual si elimina directamente de la base de datos
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }else {
    //         if(!usuarioBorrado){
    //             res.json({
    //                 ok: false,
    //                 message: 'No existe el usuario'
    //             });
    //         }else {

    //             res.json({
    //                 ok: true,
    //                 usuario: usuarioBorrado
    //             });
    //         }
    //     }
    // });
});

module.exports = app;
