const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.post('/agregarAsistencia', async (req, res) => {
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



router.put('/actualizarAsis/:alumnos_id/:fecha', async (req, res) => {
    const { alumnos_id, fecha } = req.params;
    const { estado, correo_personal, uniforme_id } = req.body;
    console.log("ya agarro la NUEVA ruta");
  
    try {
      const [rows] = await db.query(
        'SELECT * FROM asistencia WHERE alumnos_id = ? AND fecha = ?',
        [alumnos_id, fecha]
      );
  
      if (rows.length > 0) {
        const updateQuery = `
          UPDATE asistencia 
          SET estado = ?, correo_personal = ?, uniforme_id = ?
          WHERE alumnos_id = ? AND fecha = ?
        `;
        await db.query(updateQuery, [estado, correo_personal, uniforme_id, alumnos_id, fecha]);
  
        res.json({ mensaje: 'Asistencia actualizada correctamente' });
      } else {
        
        res.status(404).json({ error: 'No existe un registro previo para este alumno y fecha' });
      }
  
    } catch (error) {
      console.error('Error al actualizar la asistencia:', error);
      res.status(500).json({ error: 'Error al actualizar la asistencia' });
    }
});

router.post('/asistenciaDeGrado', async (req, res) => {
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

module.exports = router;