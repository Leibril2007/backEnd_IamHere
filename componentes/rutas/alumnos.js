const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/alumnos', async (req, res) => {
    try {
      const [results] = await db.query('SELECT id, nombre, apellido, grados_id FROM alumnos');
      res.json(results);
    } catch (err) {
      console.error('Error al obtener grados:', err);
      res.status(500).send('Error en la consulta');
    }
});


router.post('/uniforme', async (req, res) => {
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
  
  
router.post('/agregarAlumno', async(req, res) =>{
  
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

router.delete('/eliminarAlumno', async (req, res) => {
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
  

module.exports = router;