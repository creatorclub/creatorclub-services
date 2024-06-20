const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Chat = sequelize.define(
  "Chat",
  {
    chat_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
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
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
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
    is_collab_chat: {
        type: DataTypes.STRING,
        allowNull: false,
      },
  },
  {
    tableName: "chats",
    timestamps: false,
  }
);

module.exports = Chat;