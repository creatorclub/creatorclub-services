const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const LogsModel = sequelize.define("LogsModel", {
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
    defaultValue: [],
  },
  api_request_response: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  event: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  app_error: {
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
  user_id: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  user_device_model: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  user_os_platform: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  user_os_version: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  latitude: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  long: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  session_started_timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  last_session_end_timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = LogsModel;
