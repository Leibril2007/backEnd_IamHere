const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.get('/coordinador/:id/grados', async (req, res) => {
    const coordinadorId = req.params.id;
  
    try {
      const [result] = await db.query('SELECT nivel_id FROM coordinador WHERE id = ?', [coordinadorId]);
  
      if (result.length === 0) {
        return res.status(404).json({ message: 'Profesor no encontrado' });
      }
  
      const nivelId = result[0].nivel_id;

      console.log("valorNivel",nivelId);
  
      const [grados] = await db.query('SELECT id, nombre FROM grados WHERE nivel_id = ?', [nivelId]);
  
      res.json(grados);
    } catch (err) {
      console.error('Error al obtener grados:', err);
      res.status(500).send('Error en la consulta');
    }
});


  

module.exports = router;