// DEPENDENCIAS
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500', 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// BASE DE DATOS ----------------------------------------------------------------------

const db = mysql.createPool({
  host: 'baxmemkok0eond24r5cb-mysql.services.clever-cloud.com',
  user: 'upddy0zqcwcvvciv',
  password: 'hdl3V13CY0WHI5ZdVxow',
  database: 'baxmemkok0eond24r5cb',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});


(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Conexión a la base de datos establecida');
    connection.release();
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
  }
})();

// CONEXIONES ------------------------------------------------------------------------------------

app.post('/login', async (req, res) => {
  const { correo: entrada, contraseña } = req.body;

  const sql = `
    SELECT u.usuario, u.contraseña, u.id, p.correo, p.grados_id,g.nombre AS nombre_grado FROM usuarios u LEFT JOIN profesores p ON u.profesores_id = p.id LEFT JOIN grados g ON p.grados_id = g.id
    WHERE (u.usuario = ? OR p.correo = ?) AND u.contraseña = ?`;

  try {
    const [results] = await db.query(sql, [entrada, entrada, contraseña]);

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    const usuario = results[0];

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: usuario.id,
        usuario: usuario.usuario,
        correo: usuario.correo || entrada,
        grados_id: usuario.nombre_grado
      }
    });
  } catch (err) {
    console.error('ERROR en la consulta de login:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});


app.get('/profesor/:id/nivel', async (req, res) => {
  const profesorId = req.params.id;

  try {
    const [result] = await db.query('SELECT nivel_id FROM profesores WHERE id = ?', [profesorId]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }

    const nivelId = result[0].nivel_id;

    const [grados] = await db.query('SELECT id, nombre FROM grados WHERE nivel_id = ?', [nivelId]);

    res.json(grados);
  } catch (err) {
    console.error('Error al obtener grados:', err);
    res.status(500).send('Error en la consulta');
  }
});


app.get('/grados', async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, nombre FROM grados');
    res.json(results);
  } catch (err) {
    console.error('Error al obtener grados:', err);
    res.status(500).send('Error en la consulta');
  }
});


app.get('/alumnos', async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, nombre, apellido, grados_id FROM alumnos');
    res.json(results);
  } catch (err) {
    console.error('Error al obtener grados:', err);
    res.status(500).send('Error en la consulta');
  }
});


app.post('/agregarAsistencia', async (req, res) => {
  let { usuarios_id, alumnos_id, fecha, estado, correo_personal, uniforme_id } = req.body;
  
  let query = 'INSERT INTO asistencia (usuarios_id, alumnos_id, fecha, estado, correo_personal, uniforme_id) VALUES (?, ?, ?, ?, ?, ?)';

  try {
    const [result] = await db.query(query, [usuarios_id, alumnos_id, fecha, estado, correo_personal, uniforme_id]);
    
    res.status(201).json({
      id: result.insertId,
      usuarios_id,
      alumnos_id,
      fecha,
      estado,
      correo_personal,
      uniforme_id

    });
  } catch (err) {
    console.error('Error al insertar la asistencia: ', err);
    res.status(500).json({ error: 'Error al guardar la asistencia' });
  }
});


app.post('/uniforme', async (req, res) => {
  let {observaciones, alumnos_id} = req.body;
  
  let query = 'INSERT INTO uniforme (observaciones, alumnos_id) VALUES (?, ?)';

  try {
    const [result] = await db.query(query, [observaciones, alumnos_id]);
    
    res.status(201).json({
      id: result.insertId,
      observaciones,
      alumnos_id
    });
  } catch (err) {
    console.error('Error al insertar la asistencia: ', err);
    res.status(500).json({ error: 'Error al guardar la asistencia' });
  }
});


/* AVISO GENERAL */

app.post('/avisoGeneralAlum', async (req, res) => {

  let { correo_general, grados_id, usuarios_id } = req.body;

  try{
    let query = 'INSERT INTO avisos (correo_general, grados_id, usuarios_id) VALUES (?, ?, ?)';
 
    const [result] = await db.query(query, [correo_general, grados_id, usuarios_id]);

    res.status(201).json({
      id: result.insertId,
      correo_general,
      grados_id,
      usuarios_id
    }); 

  } catch(err){
    console.log("ERROR al insertar aviso", err);
    res.status(500).json({ error: 'Error al guardar aviso general' });
  }


});


//------------------------------------------------------------------------------------

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
