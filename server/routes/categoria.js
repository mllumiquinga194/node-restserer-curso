const express = require('express');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/authentication');
const app = express();
const Categoria = require('../models/categoria');

//MOSTRAR TODAS LAS CATEGORIAS
app.get('/categoria/:id?', [verificaToken, verificaAdmin_Role], (req, res) => {
    let categoriaId = req.params.id;

    if(categoriaId === undefined){
        var find = Categoria.find({}).sort('descripcion');
    }else{
        var find = Categoria.findById(categoriaId);
    }

    find.populate({
        path: 'usuario',
        select: 'nombre email' //para que me traiga solamente el nombre y el email
    }).exec((err, categoriasDB) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        } else {
            if (!categoriasDB) {
                return res.status(404).send({
                    ok: false,
                    message: 'No se han encontrado las categorias'
                });
            } else {
                return res.status(200).send({
                    ok: true,
                    categorias: categoriasDB
                });
            }
        }
    });
});

//CREAR NUEVA CATEGORIA. el modelo tiene un campo Usuario el cual llenare con el id del usuario
app.post('/categoria', [verificaToken, verificaAdmin_Role], function (req, res) {

    let body = req.body;
    let userId = req.usuario._id;//gracias al token, aqui tengo el payload del usuario

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: userId
    });

    categoria.save((err, categoriaStored) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        } else {
            if (!categoriaStored) {
                return res.status(404).send({
                    ok: false,
                    message: 'No se ha guardado la categoria'
                });
            } else {
                return res.status(200).send({
                    ok: true,
                    categoria: categoriaStored
                });
            }
        }
    });

});

//ACTUALIZAR UNA CATEGORIA
app.put('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let categoriaId = req.params.id;
    let updateDesc = {
        descripcion: req.body.descripcion
    }

    Categoria.findByIdAndUpdate(categoriaId, updateDesc, { new: true, runValidators: true }, (err, categoriaUpdated) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        } else {
            if (!categoriaUpdated) {
                return res.status(404).send({
                    ok: false,
                    message: 'No se ha actualizado la categoria'
                });
            } else {
                return res.status(200).send({
                    ok: true,
                    categoria: categoriaUpdated
                });
            }
        }
    });

});

//ELIMINAR UNA CATEGORIA
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {//solo un administrador puede borrar
    let categoriaId = req.params.id;

    Categoria.findByIdAndRemove(categoriaId, (err, categoriaDeleted) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        } else {
            if (!categoriaDeleted) {
                return res.status(404).send({
                    ok: false,
                    message: 'No se ha borrado la categoria'
                });
            } else {
                return res.status(200).send({
                    ok: true,
                    categoria: categoriaDeleted
                });
            }
        }
    });

});

module.exports = app;