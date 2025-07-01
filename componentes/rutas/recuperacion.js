const express = require('express');
const router = express.Router();
const db = require('../config/db');
const transporter = require('../config/mailer');

let codigos = {}; // Guarda temporalmente los códigos enviados

router.post('/enviarCodigo', async (req, res) => {
    const { correo } = req.body;
  
    try {
      
      const [results] = await db.query('SELECT * FROM profesores WHERE correo = ?', [correo]);
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Correo no registrado' });
      }
  
      // Generar código
      const codigo = Math.floor(100000 + Math.random() * 900000);
      codigos[correo] = codigo;
  
      // Enviar correo
      const mailOptions = {
        from: 'imhereapp2025@gmail.com',
        to: correo,
        subject: 'Código de recuperación',
        text: `Hola! este es tu código de recuperación 😉: ${codigo}`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({ success: true, mensaje: 'Código enviado correctamente' });
    } catch (err) {
      console.error('Error al enviar código:', err);
      res.status(500).json({ error: 'Error al enviar el código' });
    }
  });
  
  
  router.post('/verificarCodigo', (req, res) => {
    const { correo, codigoIng } = req.body;
  
    const codigoCorrecto = codigos[correo];
  
    if (!codigoCorrecto) {
      return res.status(404).json({ success: false, message: 'No se ha enviado un código a este correo' });
    }
  
    if (parseInt(codigoIng) !== codigoCorrecto) {
      return res.status(401).json({ success: false, message: 'Código incorrecto' });
    }
  
    // Si llega aquí, el código es válido
    res.json({ success: true, message: 'Código verificado correctamente' });
  });
  
  
  
  router.post('/cambiarContrasena', async (req, res) => {
    const { correo, codigoIng, nuevContra } = req.body;
  
    const codigoGuardado = codigos[correo];
  
    if (!codigoGuardado) {
      return res.status(400).json({ success: false, message: 'No se ha enviado código a este correo' });
    }
  
    if (parseInt(codigoIng) !== codigoGuardado) {
      return res.status(401).json({ success: false, message: 'Código incorrecto' });
    }
  
    try {
      const query = ` UPDATE usuarios JOIN profesores ON usuarios.profesores_id = profesores.id SET usuarios.contraseña = ? WHERE profesores.correo = ?`;
      await db.query(query, [nuevContra, correo]);
  
      // Eliminar el código una vez utilizado
      delete codigos[correo];
  
      res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
      res.status(500).json({ success: false, message: 'Error del servidor al actualizar la contraseña' });
    }
  });

module.exports = router;