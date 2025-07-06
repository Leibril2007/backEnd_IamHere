// DEPENDENCIAS
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5501', 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Rutas modularizadas
app.use(require('./componentes/rutas/login'));
app.use(require('./componentes/rutas/alumnos'));
app.use(require('./componentes/rutas/asistencia'));
app.use(require('./componentes/rutas/grados'));
app.use(require('./componentes/rutas/correos'));
app.use(require('./componentes/rutas/profesores'));
app.use(require('./componentes/rutas/recuperacion'));
app.use(require('./componentes/rutas/avisos'));
app.use(require('./componentes/rutas/uniformeYObs'));
app.use(require('./componentes/rutas/asistenciaCoordi'));
/* app.use(require('./componentes/rutas/coordinador')); */


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
