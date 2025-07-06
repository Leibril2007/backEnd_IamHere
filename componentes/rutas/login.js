const express = require('express');
const router = express.Router();
const db = require('../config/db');

// CONEXIONES ------------------------------------------------------------------------------------

router.post('/login', async (req, res) => {
  const { correo: entrada, contraseña } = req.body;

  const sql = `
    SELECT 
      u.usuario, 
      u.contraseña, 
      u.id, 
      u.coordinador_id,
      u.profesores_id,
      p.correo AS correo_profesor, 
      c.correo AS correo_coordinador, 
      p.grados_id, 
      g.nombre AS nombre_grado
    FROM usuarios u
    LEFT JOIN profesores p ON u.profesores_id = p.id
    LEFT JOIN grados g ON p.grados_id = g.id
    LEFT JOIN coordinador c ON u.coordinador_id = c.id
    WHERE 
      (u.usuario = ? OR p.correo = ? OR c.correo = ?) 
      AND u.contraseña = ?`;

  try {
    const [results] = await db.query(sql, [entrada, entrada, entrada, contraseña]);

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    const usuario = results[0];

    const correo = usuario.correo_profesor || usuario.correo_coordinador || entrada;

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: usuario.id,
        usuario: usuario.usuario,
        profesores_id: usuario.profesores_id,
        correo,
        grados_id: usuario.nombre_grado || null,
        esCoordinador: !!usuario.correo_coordinador,
        coordinador_id: usuario.coordinador_id || null
      }
    });
  } catch (err) {
    console.error('ERROR en la consulta de login:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});



module.exports = router;