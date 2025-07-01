const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'baxmemkok0eond24r5cb-mysql.services.clever-cloud.com',
    user: 'upddy0zqcwcvvciv',
    password: 'hdl3V13CY0WHI5ZdVxow',
    database: 'baxmemkok0eond24r5cb',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

(async () => {
    try {
      const connection = await db.getConnection();
      console.log('Conexión a la base de datos establecida');
      connection.release();
    } catch (err) {
      console.error('Error al conectar a la base de datos:', err);
    }
})();

module.exports = db;