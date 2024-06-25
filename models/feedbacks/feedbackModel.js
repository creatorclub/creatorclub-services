const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const FeedbackModel = sequelize.define(
  "FeedbackModel",
  {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    feedback: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "feedbacks",
    timestamps: false,
  }
);

module.exports = FeedbackModel;
