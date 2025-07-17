const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/profesor/:id/grados', async (req, res) => {
  const profesorId = req.params.id;

  try {
    // Buscar en profesores
    const [profesorResult] = await db.query('SELECT nivel_id FROM profesores WHERE id = ?', [profesorId]);

    let nivelId = null;

    if (profesorResult.length > 0) {
      nivelId = profesorResult[0].nivel_id;
    } else {
      const [coordinadorResult] = await db.query('SELECT nivel_id FROM coordinador WHERE id = ?', [profesorId]);

      if (coordinadorResult.length > 0) {
        nivelId = coordinadorResult[0].nivel_id;
      } else {
        return res.status(404).json({ message: 'Profesor o Coordinador no encontrado' });
      }
    }

    console.log("valorNivel", nivelId);

    const [grados] = await db.query('SELECT id, nombre FROM grados WHERE nivel_id = ?', [nivelId]);

    res.json(grados);
  } catch (err) {
    console.error('Error al obtener grados:', err);
    res.status(500).send('Error en la consulta');
  }
});



router.get('/profesor/:id/nivel', async (req, res) => {
  const profesorId = req.params.id;

  try {
    const [result] = await db.query('SELECT nivel_id FROM profesores WHERE id = ?', [profesorId]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }

    const nivelId = result[0].nivel_id;

    const [nivelPert] = await db.query('SELECT nombre, id FROM nivel WHERE id = ?', [nivelId]);

    res.json(nivelPert);
  } catch (err) {
    console.error('Error al obtener grados:', err);
    res.status(500).send('Error en la consulta');
  }
});

router.post('/agregarProfesor', async (req, res) => {
  const {
    nombre,
    apellido,
    correo,
    gradoId,
    nivelId,
    usuario,
    contraseña
  } = req.body;

  const conn = await db.getConnection(); 

  try {
    await conn.beginTransaction();

    const insertProfesorQuery = `
      INSERT INTO profesores (nombre, apellido, correo, grados_id, nivel_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [profesorResult] = await conn.query(insertProfesorQuery, [
      nombre,
      apellido,
      correo,
      gradoId,
      nivelId
    ]);

    const profesorId = profesorResult.insertId;

    const insertUsuarioQuery = `
      INSERT INTO usuarios (usuario, contraseña, profesores_id)
      VALUES (?, ?, ?)
    `;

    await conn.query(insertUsuarioQuery, [usuario, contraseña, profesorId]);

    await conn.commit();

    res.status(201).json({
      mensaje: "Profesor agregado con éxito",
      profesorId,
      nombre,
      apellido,
      correo,
      gradoId,
      nivelId,
      usuario
    });
  } catch (error) {
    await conn.rollback();
    console.error("❌ Error al insertar profesor:", error);
    res.status(500).json({ error: "Error al guardar profesor" });
  } finally {
    conn.release();
  }
});

module.exports = router;