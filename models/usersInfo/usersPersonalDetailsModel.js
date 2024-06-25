const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const UsersPersonalDetails = sequelize.define(
  "UsersPersonalDetails",
  {
    user_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    device_token: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue:[]
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  { tableName: "users", timestamps: false }
);
module.exports = UsersPersonalDetails;
