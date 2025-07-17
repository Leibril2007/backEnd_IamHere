const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.get('/grados', async (req, res) => {
    try {
      const [results] = await db.query('SELECT id, nombre, nivel_id FROM grados');
      res.json(results);
    } catch (err) {
      console.error('Error al obtener grados:', err);
      res.status(500).send('Error en la consulta');
    }
});

router.get('/niveles', async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, nombre FROM nivel');
    res.json(results);
  } catch (err) {
    console.error('Error al obtener grados:', err);
    res.status(500).send('Error en la consulta');
  }
});

router.post('/admin/agregar/niveles', async (req, res) => {
  const { nombre } = req.body;

  try {
    const [results] = await db.query('INSERT INTO nivel (nombre) VALUES (?)', [nombre]);
    res.json({ success: true, id: results.insertId });
  } catch (err) {
    console.error('Error al insertar nivel:', err);
    res.status(500).send('Error en la consulta');
  }
});

router.post('/admin/agregar/grados', async (req, res) => {
  const { nombre, nivel_id } = req.body;

  // Validación rápida
  if (!nombre || !nivel_id) {
    return res.status(400).json({ error: 'Nombre y nivel_id son requeridos' });
  }

  try {
    const [results] = await db.query(
      'INSERT INTO grados (nombre, nivel_id) VALUES (?, ?)',
      [nombre, nivel_id]
    );
    res.json({ success: true, id: results.insertId });
  } catch (err) {
    console.error('Error al insertar grado:', err);
    res.status(500).send('Error en la consulta');
  }
});


module.exports = router;