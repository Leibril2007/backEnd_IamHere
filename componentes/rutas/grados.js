const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.get('/grados', async (req, res) => {
    try {
      const [results] = await db.query('SELECT id, nombre FROM grados');
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

module.exports = router;