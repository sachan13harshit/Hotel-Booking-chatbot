const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './chat_history.sqlite'
});

module.exports = sequelize;