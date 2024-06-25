const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const FeatureRequestsModel = sequelize.define(
  "FeatureRequestsModel",
  {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    feature_request: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "feature_requests",
    timestamps: false,
  }
);

module.exports = FeatureRequestsModel;
