//========================PUERTO

PORT = process.env.PORT || 3000;


//========================ENTORNO

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//========================BASEDATOS

let urlDB;

if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = 'mongodb://cafe-user:m123456@ds127841.mlab.com:27841/cafe_node';
}


process.env.URLDB = urlDB;




