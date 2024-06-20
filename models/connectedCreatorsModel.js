const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
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
    pending_users_request_sent: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    my_pending_users_requests: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    tableName: "connected_creators",
    timestamps: false,
  }
);
module.exports = ConnectedCreators;
