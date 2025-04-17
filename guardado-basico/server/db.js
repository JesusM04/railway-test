const { Sequelize } = require('sequelize');

// Usamos las variables de entorno para las credenciales
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: false, // opcional: elimina logs SQL en consola
});


try {
  sequelize.authenticate();
  console.log('Conexión a la base de datos exitosa.');
} catch (error) {
  console.error('No se pudo conectar a la base de datos:', error);
}

module.exports = sequelize;
