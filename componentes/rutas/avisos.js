const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.post('/avisoGeneralAlum', async (req, res) => {

    let { correo_general, grados_id, usuarios_id } = req.body;
  
    try{
      let query = 'INSERT INTO avisos (correo_general, grados_id, usuarios_id) VALUES (?, ?, ?)';
   
      const [result] = await db.query(query, [correo_general, grados_id, usuarios_id]);
  
      res.status(201).json({
        id: result.insertId,
        correo_general,
        grados_id,
        usuarios_id
      }); 
  
    } catch(err){
      console.log("ERROR al insertar aviso", err);
      res.status(500).json({ error: 'Error al guardar aviso general' });
    }
  
  
});

module.exports = router;