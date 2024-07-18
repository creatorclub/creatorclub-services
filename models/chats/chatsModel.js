const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Chat = sequelize.define(
  "Chat",
  {
    chat_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
    },
    is_collab_chat : {
      type: DataTypes.BOOLEAN,
      defaultValue : false,
    },
    collab_id : {
      type: DataTypes.STRING,
      defaultValue : "",
      allowNull: true,
    },
    receiver_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sender_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_content_timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    last_content_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receiver_unread_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    sender_unread_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_deleted : {
      type: DataTypes.BOOLEAN,
      defaultValue : false,
    }
  },
  {
    tableName: "chats",
    timestamps: false,
  }
);

module.exports = Chat;
