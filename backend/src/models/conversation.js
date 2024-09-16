const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,    
  },
  messages: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

module.exports = Conversation;