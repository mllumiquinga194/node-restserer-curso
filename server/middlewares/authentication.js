const jwt = require('jsonwebtoken');
//===========VERIFICRA TOKEN

//el next me indica que soy un middeqware jeje, creo que es asi
let verificaToken = (req, res, next) => {

    let token = req.get('Authorization')//de esta forma puedo obtener los headers.. asi lo hago por via URL.
    //req.headers.authorization asi puedo hacerlo cuando es enviado en los headers desde el cliente al servidor
    jwt.verify(token, process.env.SEED, (err, decoded) => { //verifico si el token es valido y recuperar la informacion del token. toda la informacion esta en la respuesta del callback, en este caso en decoded
        if (err) {
            return res.status(401).json({//401 error de no autorizacion
                ok: false,
                err
            });
        }
        req.usuario = decoded.usuario; //req.usuario va a ser recibido en la funcion donde aplico el middlware

        next();
    });
};

let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE'){
        next();
    }else{
        return res.json({//401 error de no autorizacion
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }

};

module.exports = {
    verificaToken,
    verificaAdmin_Role
}