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
      u.administrador_id,
      p.correo AS correo_profesor, 
      c.correo AS correo_coordinador, 
      a.correo AS correo_administrador,
      a.nombre AS nombre_administrador,
      a.id AS administrador_id,
      p.grados_id, 
      g.nombre AS nombre_grado
    FROM usuarios u
    LEFT JOIN profesores p ON u.profesores_id = p.id
    LEFT JOIN grados g ON p.grados_id = g.id
    LEFT JOIN coordinador c ON u.coordinador_id = c.id
    LEFT JOIN administrador a ON u.administrador_id = a.id
    WHERE 
      (u.usuario = ? OR p.correo = ? OR c.correo = ? OR a.correo = ?) 
      AND u.contraseña = ?`;

  try {
    const [results] = await db.query(sql, [entrada, entrada, entrada, entrada, contraseña]);

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    const usuario = results[0];

    const correo = usuario.correo_profesor || usuario.correo_coordinador || usuario.correo_administrador || entrada;

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: usuario.id,
        usuario: usuario.usuario,
        correo,
        profesores_id: usuario.profesores_id || null,
        grados_id: usuario.nombre_grado || null,
        coordinador_id: usuario.coordinador_id || null,
        administrador_id: usuario.administrador_id || null,
        nombre_administrador: usuario.nombre_administrador || null,
        esProfesor: !!usuario.profesores_id,
        esCoordinador: !!usuario.coordinador_id,
        esAdministrador: !!usuario.administrador_id
      }
    });
  } catch (err) {
    console.error('ERROR en la consulta de login:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});




module.exports = router;