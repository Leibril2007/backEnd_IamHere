const express = require('express');
const router = express.Router();
const db = require('../config/db');
const transporter = require('../config/mailer');


router.post('/verificarCorreo', async(req, res) => {

    let { idAlumnoRec, mensaje } = req.body;
  
    try {
  
      let [veriCorreo] = await db.query(`SELECT correo FROM alumnos WHERE id = ?`, [idAlumnoRec]);
      
      if (veriCorreo.length === 0) {
        return res.status(404).json({ error: 'Alumno no encontrado' });
      }
  
      let correos = veriCorreo[0].correo;
  
      const mailOptions = {
        from: '"Asistencia con Im Here! 2025" <imhereapp2025@gmail.com>',
        to: correos,
        subject: 'Observación personalizada',
        text: mensaje
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({
        success: true,
        message: 'Correo enviado correctamente',
        user: {
          correo: correos
        }
      });
  
      
    } catch (error) {
      console.error('Error al verificar correo:', error);
      res.status(500).json({ success: false, message: 'Error del servidor al verificar el correo' });
    }
  
});
  
router.post('/correoGeneral', async(req, res) => {

  let { idGradoSel, mensaje } = req.body;
  
  try {

    let [veriGradoMen] = await db.query(` SELECT correo FROM alumnos WHERE grados_id = ?`, [idGradoSel]);

    if (veriGradoMen.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    const listaCorreos = veriGradoMen.map(alum => alum.correo);

    const mailOptions = {
      from: '"Aviso General Im Here! 2025" <imhereapp2025@gmail.com>',
      to: listaCorreos,
      subject: 'Aviso general para el grado',
      text: mensaje
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Correos enviados correctamente' });

    
  } catch (error) {
    console.error('Error al verificar correo:', error);
    res.status(500).json({ success: false, message: 'Error del servidor al verificar el correo' });
  }


});
  
  
  
router.post('/correoPorUniforme', async(req, res) => {

  let { idAlumnoRec, mensaje } = req.body;

  try {

    let [veriCorreo] = await db.query(`SELECT nombre, apellido, correo FROM alumnos WHERE id = ?`, [idAlumnoRec]);
    
    if (veriCorreo.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    let correos = veriCorreo[0].correo;

    const mailOptions = {
      from: '"Reporte por uniforme" <imhereapp2025@gmail.com>',
      to: correos,
      subject: 'Asistencia con Im Here! 2025',
      text: mensaje
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Correo enviado correctamente',
      user: {
        correo: correos
      }
    });

    
  } catch (error) {
    console.error('Error al verificar correo:', error);
    res.status(500).json({ success: false, message: 'Error del servidor al verificar el correo' });
  }

});

module.exports = router;