const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const LogsModel = sequelize.define(
  "LogsModel",
  {
    log_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: false,
    },
    api_type: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    api_status: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    api_request_body: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    api_request_response: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    event: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    app_error: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    device_model: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    os_platform: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    os_version: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    latitude: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    longitude: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    request_timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    response_timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    session_started_timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    last_session_end_timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { tableName: "logs", timestamps: false }
);

module.exports = LogsModel;
