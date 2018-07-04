const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');//para validar el correo, aunque puede hacerse con cualquier cosa

let rolesValidos = { //para validar los roles validos
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
};

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El email es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos,
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    },
});

//para modificar el objeto a la hora de imprimir para que no me muestre la password de ninguna manera modificando el metodo TOJSON
usuarioSchema.methods.toJSON = function (){
    let user = this; // user es igual a lo que sea que tenga en ese momento
    let userObject = user.toObject();//tomo el objeto de ese usuario. de esta manera ya tengo todas las propiedades y metodos
    delete userObject.password;// borro la password. OJO, esto es para imprimir pero en la base de datos si esta

    return userObject;
}

usuarioSchema.plugin(uniqueValidator, {//para validar lo del correo
    message: '{PATH} debe ser unico'
})

module.exports = mongoose.model('Usuario', usuarioSchema);
