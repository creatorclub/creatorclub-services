const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const UsersPersonalDetails=require("./usersPersonalDetailsModel")

const UsersInterests = sequelize.define(
  "UsersInterests",
  {
    user_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: UsersPersonalDetails,
        key: "user_id",
      },
      allowNull: false,
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    interest: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    latitude: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
    },
    longitude: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
    },
    country: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
    },
  },
  { tableName: "user_interests", timestamps: false }
);
module.exports = UsersInterests;
