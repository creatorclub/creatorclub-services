const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const ConnectedCreators = sequelize.define(
  "ConnectedCreators",
  {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    connected_users: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    rejected_users: {
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
    tableName: "creators_swipe_requests",
    timestamps: false,
  }
);
module.exports = ConnectedCreators;
