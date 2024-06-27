const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const ConnectedCollabs = sequelize.define(
  "ConnectedCollabs",
  {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    connected_collabs: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    rejected_collabs: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    outbox: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    inbox: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    tableName: "collaborations_swipe_requests",
    timestamps: false,
  }
);
module.exports = ConnectedCollabs;
