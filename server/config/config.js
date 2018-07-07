//========================PUERTO

PORT = process.env.PORT || 3000;


//========================ENTORNO

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';//si es dev, estoy en la base de datos de desarrollo

//========================VENCIMIENTO DEL TOKEN====
//60seg, 60min, 24hrs, 30dias

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;


//=================SEED de AUTENTICAION
process.env.SEED = process.env.SEED || 'este-es-es-seed-desarrollo';

//========================BASEDATOS
let urlDB;

if(process.env.NODE_ENV === 'dev'){//si es dev, estoy en la base de datos de desarrollo
    urlDB = 'mongodb://localhost:27017/cafe';
}else{ //sino, uso la url de mlab de mongo que ya esta en heroku config
    urlDB = process.env.MONGO_URL;//mongo_URL ya fue definido en heroku config
}

process.env.URLDB = urlDB;


//===============GOOGLE CLIENT ID

process.env.CLIENT_ID = process.env.CLIENT_ID || '128216496353-oaeiv6h3qdr89fn699js3sbi19fom6aj.apps.googleusercontent.com';




