const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.get('/proyecciones/recUniforme/:idAlumno', async (req, res) => {
    const idAlumno = req.params.idAlumno;
  
    try {
        const consulta = `SELECT a.fecha, u.observaciones FROM asistencia a LEFT JOIN uniforme u ON a.uniforme_id = u.id WHERE a.alumnos_id = ? AND u.observaciones IS NOT NULL AND a.fecha IS NOT NULL`;  

      const [filas] = await db.query(consulta, [idAlumno]);
      res.json(filas);
    } catch (err) {
      console.error('Error al obtener asistencia semanal por nivel:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    }

});

router.get('/proyecciones/recObservaciones/:idAlumno', async (req, res) => {
    const idAlumno = req.params.idAlumno;
  
    try {
        const consulta = `SELECT fecha, correo_personal FROM asistencia WHERE alumnos_id = ? AND correo_personal IS NOT NULL AND fecha IS NOT NULL`;  

      const [filas] = await db.query(consulta, [idAlumno]);
      res.json(filas);
    } catch (err) {
      console.error('Error al obtener asistencia semanal por nivel:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    }

});



module.exports = router;