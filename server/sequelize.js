const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('project', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
