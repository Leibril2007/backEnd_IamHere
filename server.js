// DEPENDENCIAS
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5501', 
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

// TRANSPORTADOR DE CORREO --------------------------------------

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'imhereapp2025@gmail.com',
    pass: 'hbis ejxx lzde hkqj' 
  }
});

let codigos = {}; // Guarda temporalmente los códigos enviados


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


/*------------------- INSERTAR DATOS ----------------------------------------------------------- */

app.post('/agregarAsistencia', async (req, res) => {
  let { usuarios_id, alumnos_id, fecha, estado, correo_personal, uniforme_id } = req.body;

  try {
    let query;
    let params;

    if (uniforme_id !== null && uniforme_id !== undefined) {
      query = `
        INSERT INTO asistencia 
        (usuarios_id, alumnos_id, fecha, estado, correo_personal, uniforme_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      params = [usuarios_id, alumnos_id, fecha, estado, correo_personal, uniforme_id];
    } else {
      query = `
        INSERT INTO asistencia 
        (usuarios_id, alumnos_id, fecha, estado, correo_personal) 
        VALUES (?, ?, ?, ?, ?)
      `;
      params = [usuarios_id, alumnos_id, fecha, estado, correo_personal];
    }

    const [result] = await db.query(query, params);

    res.status(201).json({
      id: result.insertId,
      usuarios_id,
      alumnos_id,
      fecha,
      estado,
      correo_personal,
      uniforme_id: uniforme_id ?? null
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


app.post('/asistenciaDeGrado', async (req, res) => {

  let { grado_id, estado, fecha, idUser } = req.body;

  try {
    
    let [guardarAsis] =await db.query(' INSERT INTO asistenciaGrado (grados_id, estado, fecha, usuarios_id) VALUES (?,?,?,?)', [grado_id, estado, fecha, idUser]);

    res.status(201).json({
      id: guardarAsis.insertId,
      grado_id,
      estado,
      fecha,
      idUser
    });


  } catch (error) {
    console.error('Error al insertar la asistencia: ', error);
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


app.post('/agregarAlumno', async(req, res) =>{

  let { nombre, apellido, correoIns, idGrado } = req.body;

  try{
    let agregarAl = 'INSERT INTO alumnos (nombre, apellido, correo, grados_id) VALUES (?, ?, ?, ?)';
 
    const [result] = await db.query(agregarAl, [nombre, apellido, correoIns, idGrado]);

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellido,
      correoIns, 
      idGrado
    }); 

  } catch(err){
    console.log("ERROR al insertar alumno", err);
    res.status(500).json({ error: 'Error al guardar Alumno' });
  }

});


/* RUTAS DE ELIMINAR ----------------------------------------------- */

app.delete('/eliminarAlumno', async (req, res) => {
  const { passIng, idAlumnoEl } = req.body;

  try {
    
    const verificarContra = `SELECT contraseña FROM usuarios WHERE contraseña = ?`;
    const [resVeriC] = await db.query(verificarContra, [passIng]);

    if (resVeriC.length === 0) {
      return res.status(403).json({ success: false, message: 'Contraseña incorrecta' });
    }

    const veriAlumnoId = `SELECT id FROM alumnos WHERE id = ?`;
    const [resAlumno] = await db.query(veriAlumnoId, [idAlumnoEl]);

    if (resAlumno.length === 0) {
      return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
    }

    const elimiAsistenciaAl = `DELETE FROM asistencia WHERE alumnos_id = ?`;
    await db.query(elimiAsistenciaAl, [idAlumnoEl]);


    const elimiUniAL = `DELETE FROM uniforme WHERE alumnos_id = ?`;
    await db.query(elimiUniAL, [idAlumnoEl]);

    const elimiALum = `DELETE FROM alumnos WHERE id = ?`;
    await db.query(elimiALum, [idAlumnoEl]);

    res.json({ success: true, message: 'Alumno, asistencias y uniformes eliminados correctamente' });

  } catch (error) {
    console.error('ERROR al eliminar alumno:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

/* RECUPERAR CONTRASEÑA ------------------------------------------------*/

app.post('/enviarCodigo', async (req, res) => {
  const { correo } = req.body;

  try {
    
    const [results] = await db.query('SELECT * FROM profesores WHERE correo = ?', [correo]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Correo no registrado' });
    }

    // Generar código
    const codigo = Math.floor(100000 + Math.random() * 900000);
    codigos[correo] = codigo;

    // Enviar correo
    const mailOptions = {
      from: 'imhereapp2025@gmail.com',
      to: correo,
      subject: 'Código de recuperación',
      text: `Hola! este es tu código de recuperación 😉: ${codigo}`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, mensaje: 'Código enviado correctamente' });
  } catch (err) {
    console.error('Error al enviar código:', err);
    res.status(500).json({ error: 'Error al enviar el código' });
  }
});


app.post('/verificarCodigo', (req, res) => {
  const { correo, codigoIng } = req.body;

  const codigoCorrecto = codigos[correo];

  if (!codigoCorrecto) {
    return res.status(404).json({ success: false, message: 'No se ha enviado un código a este correo' });
  }

  if (parseInt(codigoIng) !== codigoCorrecto) {
    return res.status(401).json({ success: false, message: 'Código incorrecto' });
  }

  // Si llega aquí, el código es válido
  res.json({ success: true, message: 'Código verificado correctamente' });
});



app.post('/cambiarContrasena', async (req, res) => {
  const { correo, codigoIng, nuevContra } = req.body;

  const codigoGuardado = codigos[correo];

  if (!codigoGuardado) {
    return res.status(400).json({ success: false, message: 'No se ha enviado código a este correo' });
  }

  if (parseInt(codigoIng) !== codigoGuardado) {
    return res.status(401).json({ success: false, message: 'Código incorrecto' });
  }

  try {
    const query = ` UPDATE usuarios JOIN profesores ON usuarios.profesores_id = profesores.id SET usuarios.contraseña = ? WHERE profesores.correo = ?`;
    await db.query(query, [nuevContra, correo]);

    // Eliminar el código una vez utilizado
    delete codigos[correo];

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    res.status(500).json({ success: false, message: 'Error del servidor al actualizar la contraseña' });
  }
});

// -------------------------------- CORREOS ------------------------------------

app.post('/verificarCorreo', async(req, res) => {

  let { idAlumnoRec, mensaje } = req.body;

  try {

    let [veriCorreo] = await db.query(`SELECT correo FROM alumnos WHERE id = ?`, [idAlumnoRec]);
    
    if (veriCorreo.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    let correos = veriCorreo[0].correo;

    const mailOptions = {
      from: '"Asistencia con Im Here! 2025" <imhereapp2025@gmail.com>',
      to: correos,
      subject: 'Observación personalizada',
      text: mensaje
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Correo enviado correctamente',
      user: {
        correo: correos
      }
    });

    
  } catch (error) {
    console.error('Error al verificar correo:', error);
    res.status(500).json({ success: false, message: 'Error del servidor al verificar el correo' });
  }

});

app.post('/correoGeneral', async(req, res) => {

  let { idGradoSel, mensaje } = req.body;
  
  try {

    let [veriGradoMen] = await db.query(` SELECT correo FROM alumnos WHERE grados_id = ?`, [idGradoSel]);

    if (veriGradoMen.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    const listaCorreos = veriGradoMen.map(alum => alum.correo);

    const mailOptions = {
      from: '"Aviso General Im Here! 2025" <imhereapp2025@gmail.com>',
      to: listaCorreos,
      subject: 'Aviso general para el grado',
      text: mensaje
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Correos enviados correctamente' });

    
  } catch (error) {
    console.error('Error al verificar correo:', error);
    res.status(500).json({ success: false, message: 'Error del servidor al verificar el correo' });
  }


});



app.post('/correoPorUniforme', async(req, res) => {

  let { idAlumnoRec, mensaje } = req.body;

  try {

    let [veriCorreo] = await db.query(`SELECT nombre, apellido, correo FROM alumnos WHERE id = ?`, [idAlumnoRec]);
    
    if (veriCorreo.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    let correos = veriCorreo[0].correo;

    const mailOptions = {
      from: '"Reporte por uniforme" <imhereapp2025@gmail.com>',
      to: correos,
      subject: 'Asistencia con Im Here! 2025',
      text: mensaje
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Correo enviado correctamente',
      user: {
        correo: correos
      }
    });

    
  } catch (error) {
    console.error('Error al verificar correo:', error);
    res.status(500).json({ success: false, message: 'Error del servidor al verificar el correo' });
  }

});


//------------------------------------------------------------------------------------

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
