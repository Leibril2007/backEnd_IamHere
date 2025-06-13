// DEPENDENCIAS
var express = require('express');
var cors = require('cors');
var path = require('path');
var mysql = require('mysql2');

var app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500',
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); // Para parsear formularios

// Rutas del servidor
app.get('/', (req, res) => {
  res.send('¡Hola desde mi backend en Express!');
});

// VERIFICACION DE RUTA ESCUCHADA
app.get('/hola', (req, res) => {
  res.send('HOLI MUNDO');
});


// CONEXION A BD-----------------------------------------------------------------

const baseDeDatos = mysql.createConnection({

  host: 'localhost', 
  user: 'root', 
  password: 'Patitos.123',
  database: 'im_here',


})

baseDeDatos.connect((err) => {

  if(err){
    console.error('Error de conexión a la base de datos: ', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');

});

//-----------------------------------------------------------------



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = app;