const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.get('/coordinador/asistenciaTodosNiveles', async (req, res) => {
    const consulta = `
      SELECT 
        n.nombre AS nivel,
        COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) AS total_asistencias,
        COUNT(DISTINCT al.id) AS total_alumnos,
        ROUND((COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) / (COUNT(DISTINCT al.id) * 5)) * 100, 2) AS porcentaje_asistencia
      FROM nivel n
      JOIN grados g ON g.nivel_id = n.id
      JOIN alumnos al ON al.grados_id = g.id
      LEFT JOIN asistencia a ON a.alumnos_id = al.id
      GROUP BY n.nombre
      ORDER BY porcentaje_asistencia DESC;
    `;
  
    try {
      const [filas] = await db.query(consulta);
      res.json(filas);
    } catch (err) {
      console.error('Error al obtener porcentaje de asistencia por nivel:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    }
});

/* router.get('/coordinador/asistenciaPorProfesor', async (req, res) => {
    const consulta = `
      SELECT 
        CONCAT(p.nombre, ' ', p.apellido) AS nombre_profesor,
        COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) AS total_asistencias,
        COUNT(DISTINCT a.alumnos_id) AS total_alumnos,
        ROUND((COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) / (COUNT(DISTINCT a.alumnos_id) * 5)) * 100, 2) AS porcentaje_asistencia
      FROM profesores p
      JOIN usuarios u ON u.profesores_id = p.id
      JOIN asistencia a ON a.usuarios_id = u.id
      WHERE a.fecha BETWEEN CURDATE() - INTERVAL 7 DAY AND CURDATE()
      GROUP BY p.id
      ORDER BY total_asistencias DESC;
    `;
  
    try {
      const [filas] = await db.query(consulta);
      res.json(filas);
    } catch (err) {
      console.error('Error al obtener asistencia por profesor:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    }
}); */

router.get('/coordinador/asistenciaPorProfesor', async (req, res) => {
    const consulta = `
        SELECT 
          CONCAT(p.nombre, ' ', p.apellido) AS nombre_profesor,
          g.nombre AS grado,
          COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) AS total_asistencias,
          COUNT(DISTINCT a.alumnos_id) AS total_alumnos,
          ROUND((COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) / (COUNT(DISTINCT a.alumnos_id) * 5)) * 100, 2) AS porcentaje_asistencia
        FROM profesores p
        JOIN grados g ON p.grados_id = g.id
        JOIN usuarios u ON u.profesores_id = p.id
        JOIN asistencia a ON a.usuarios_id = u.id
        WHERE a.fecha BETWEEN CURDATE() - INTERVAL 7 DAY AND CURDATE()
        GROUP BY p.id
        ORDER BY total_asistencias DESC;
    `;
  
    try {
      const [filas] = await db.query(consulta);
      res.json(filas);
    } catch (err) {
      console.error('Error al obtener asistencia por profesor:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    }
});




module.exports = router;