const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());//esta funcion toma todo lo que se este subiendo y lo coloca en req.files

app.put('/upload/:tipo/:id', function (req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }

    // VAlidar Tipo
    let tipovalidos = ['usuarios', 'productos'];
    if (tipovalidos.indexOf(tipo) < 0) {
        return res.status(500).json({
            ok: false,
            err: {
                message: 'Solo se acepta el tipo ' + tipovalidos.join(' y ')
            }
        });
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo;//realmente estan los archivos aqui. despues de req.files. viene el nombre del input de donde estoy mandando los archivos

    // Use the mv() method to place the file somewhere on your server
    //Exensiones permitidas

    //para validas las extenciones validas en los archivos que voy a cargar
    let nombreArc = archivo.name.split('.');
    let ext = nombreArc[nombreArc.length - 1];

    let extValidas = ['png', 'gif', 'jpg', 'jpeg', 'PNG', 'GIF', 'JPG', 'JPEG'];

    if (extValidas.indexOf(ext) < 0) {
        return res.status(500).json({
            ok: false,
            err: {
                message: 'Solo se acepta ' + extValidas.join(', ')
            }
        });
    }

    //Cambiar nombre al archivo

    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${ext}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(tipo === 'usuarios'){
            imgUsuario(id, res, nombreArchivo);
        }else{
            imgProducto(id, res, nombreArchivo);
        }
    });
});

function imgUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        } else {
            if (!usuarioDB) {
                borrarArchivo(nombreArchivo, 'usuarios');
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no existe'
                    }
                });
            } else {

                borrarArchivo(usuarioDB.img, 'usuarios');

                usuarioDB.img = nombreArchivo;
                usuarioDB.save((err, usuarioStored) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    } else {
                        if (!usuarioStored) {
                            return res.status(400).json({
                                ok: false,
                                err: {
                                    message: 'no se guardo el la imagen en el usuario'
                                }
                            });
                        } else {
                            return res.status(200).json({
                                ok: true,
                                usuario: usuarioStored,
                                img: nombreArchivo
                            });
                        }
                    }
                });
            }
        }
    });

}


//==================PRODUCTOS

function imgProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        } else {
            if (!productoDB) {
                borrarArchivo(nombreArchivo, 'productos');
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no existe'
                    }
                });
            } else {

                borrarArchivo(productoDB.img, 'productos');

                productoDB.img = nombreArchivo;
                productoDB.save((err, productoStored) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    } else {
                        if (!productoStored) {
                            return res.status(400).json({
                                ok: false,
                                err: {
                                    message: 'no se guardo el la imagen en el producto'
                                }
                            });
                        } else {
                            return res.status(200).json({
                                ok: true,
                                usuario: productoStored,
                                img: nombreArchivo
                            });
                        }
                    }
                });
            }
        }
    });

}

function borrarArchivo(nombreImagen, tipo) {
    console.log(tipo);
    
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;