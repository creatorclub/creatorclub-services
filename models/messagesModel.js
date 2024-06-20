const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");



const Messages = sequelize.define(
  "Messages",{
  message_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique:true
  },
  chat_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_read: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
}, {
  tableName: 'messages',
  timestamps: false
});

module.exports = Messages;
