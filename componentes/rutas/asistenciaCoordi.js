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


router.get('/coordinador/asistenciaPorProfesor', async (req, res) => {
    const consulta = `
      SELECT 
        u.id AS usuario_id,
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

router.delete('/eliminarProfesor', async (req, res) => {
  const { passIng, idUsuario } = req.body;

  console.log("us", idUsuario, "pass", passIng);

  try {
    const verificarContra = `SELECT contraseña FROM usuarios WHERE contraseña = ?`;
    const [resVeriC] = await db.query(verificarContra, [passIng]);

    if (resVeriC.length === 0) {
      return res.status(403).json({ success: false, message: 'Contraseña incorrecta' });
    }

    const verificarUsuario = `SELECT profesores_id FROM usuarios WHERE id = ?`;
    const [resUsuario] = await db.query(verificarUsuario, [idUsuario]);

    if (resUsuario.length === 0 || resUsuario[0].profesores_id === null) {
      return res.status(404).json({ success: false, message: 'Usuario o profesor no encontrado' });
    }

    const profesorId = resUsuario[0].profesores_id;

    const eliminarAsistenciasGrado = `DELETE FROM asistenciaGrado WHERE usuarios_id = ?`;
    await db.query(eliminarAsistenciasGrado, [idUsuario]);

    const eliminarAsistencias = `DELETE FROM asistencia WHERE usuarios_id = ?`;
    await db.query(eliminarAsistencias, [idUsuario]);

    const eliminarUsuario = `DELETE FROM usuarios WHERE id = ?`;
    await db.query(eliminarUsuario, [idUsuario]);

    const eliminarProfesor = `DELETE FROM profesores WHERE id = ?`;
    await db.query(eliminarProfesor, [profesorId]);

    res.json({ success: true, message: 'Usuario, asistencias y profesor eliminados correctamente' });

  } catch (error) {
    console.error('ERROR al eliminar profesor y usuario:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});





module.exports = router;