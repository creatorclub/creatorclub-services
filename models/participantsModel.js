const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Participants = sequelize.define(
  "Participants",
  {
    participant_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    left_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "participants",
    timestamps: false,
  }
);

module.exports=Participants;