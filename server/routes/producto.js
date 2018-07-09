const express = require('express');
const Producto = require('../models/producto');
const Categoria = require('../models/categoria');
const { verificaToken } = require('../middlewares/authentication');
var mongoosePaginate = require('mongoose-pagination');

let app = express();

//========== GET PRODUCTOS PAGINADOS
app.get('/productos/:page?', verificaToken, (req, res) => {

    if (req.params.page) {
        var page = req.params.page;
    } else {
        var page = 1;
    }
    var itemsPerPage = 4;

    Producto.find().sort('name').populate({
        path: 'usuario categoria', //para indicar que quiero popular
        select: 'nombre email descripcion'//para indicar que quiero que me muestre de ese populate que estoy haciendo
    }).paginate(page, itemsPerPage, function (err, productoDB, total) {
        if (err) {
            return res.status(500).send({
                ok: false,
                message: 'error de servidor',
                err
            });
        } else {
            if (!productoDB) {
                return res.status(404).send({
                    ok: false,
                    message: 'No se han encontrado los productos'
                });
            } else {
                return res.status(200).send({
                    ok: true,
                    total_items: total,
                    itemsPerPage: itemsPerPage,
                    productos: productoDB
                });
            }
        }
    });

});

//=============Buscar Productos
app.get('/buscarPro/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let expReg = new RegExp(termino, 'i');//de esta forma creo una expresion regular de acuerdo al termino recibido y le digo que que insencible con el parametro 'i'
    
    let find = Producto.find({nombre: expReg}).sort('nombre');

    find.populate({
        path: 'usuario categoria',
        select: 'nombre email descripcion'
    }).exec((err, productoDB) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                message: 'error de servidor',
                err
            });
        } else {
            if (!productoDB) {
                return res.status(404).send({
                    ok: false,
                    message: 'No se han encontrado los productos'
                });
            } else {
                return res.status(200).send({
                    ok: true,
                    productos: productoDB
                });
            }
        }
    });

});

//=============OBTENER TODOS LOS PRODUCTOS o UNO SOLO POR ID
app.get('/producto/:id', verificaToken, (req, res) => {

    let producId = req.params.id;
    let find = Producto.findById(producId).sort('nombre');

    find.populate({
        path: 'usuario categoria',
        select: 'nombre email descripcion'
    }).exec((err, productoDB) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                message: 'error de servidor',
                err
            });
        } else {
            if (!productoDB) {
                return res.status(404).send({
                    ok: false,
                    message: 'No se han encontrado los productos'
                });
            } else {
                return res.status(200).send({
                    ok: true,
                    productos: productoDB
                });
            }
        }
    });

});

//=============CREAR UN NUEVO PRODUCTO
app.post('/productos/:id', verificaToken, (req, res) => {

    let params = req.body;
    let userId = req.usuario._id;
    let categoria = req.params.id;

    let producto = new Producto({
        nombre: params.nombre,
        precioUni: params.precioUni,
        descripcion: params.descripcion,
        usuario: userId,
        categoria: categoria
    });

    Categoria.findById(categoria, (err, categoriaDB) => {
        if (err) {
            res.status(500).send({
                ok: false,
                message: 'error de servidor',
                err
            });
        } else {
            if (!categoriaDB) {
                res.status(404).send({
                    ok: false,
                    message: 'Categoria No existe',
                    err
                });
            } else {
                producto.save((err, productoStored) => {
                    if (err) {
                        res.status(500).send({
                            ok: false,
                            message: 'error de servidor',
                            err
                        });
                    } else {
                        if (!productoStored) {
                            res.status(404).send({
                                ok: false,
                                message: 'No se ha podido guardar el producto',
                                err
                            });
                        } else {
                            res.status(200).send({
                                ok: false,
                                producto: productoStored
                            });
                        }
                    }
                });
            }
        }
    });
});

//=============ACTUALIZAR UN PRODUCTO
app.put('/productos/:id', (req, res) => {
    let producId = req.params.id;
    let prodUpdate = req.body;

    Producto.findByIdAndUpdate(producId, prodUpdate, { new: true }, (err, productoUpdated) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                message: 'error de servidor',
                err
            });
        } else {
            if (!productoUpdated) {
                return res.status(404).send({
                    ok: false,
                    message: 'No se hanactualizado el producto'
                });
            } else {
                return res.status(200).send({
                    ok: true,
                    producto: productoUpdated
                });
            }
        }
    });
});

//=============BORRAR UN PRODUCTO
app.delete('/productos/:id', (req, res) => {
    let producId = req.params.id;

    let updateDispoible = {
        disponible: false
    }

    Producto.findByIdAndUpdate(producId, updateDispoible, {new: true}, (err, prodUpdated) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                message: 'error de servidor',
                err
            });
        } else {
            if (!prodUpdated) {
                return res.status(404).send({
                    ok: false,
                    message: 'No se ha actualizado el producto'
                });
            } else {
                return res.status(200).send({
                    ok: true,
                    producto: prodUpdated
                });
            }
        }
    });

});



module.exports = app;