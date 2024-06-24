const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const UsersPersonalDetails=require("../usersPersonalDetailsModel")
const UsersDetails = sequelize.define(
  "UsersDetails",{
    user_id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        references: {
          model: UsersPersonalDetails,
          key: 'user_id'
        },
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue:""
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue:""
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue:""
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue:""
      },
      active_collab: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue:[]
      },
      social_account: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue:[]
      },
      collab_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue:0
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue:""
      },
      elo_score:{
        type:DataTypes.INTEGER,
        defaultValue:1200
      }
    },
  { tableName: "user_details", timestamps: false }
);

module.exports=UsersDetails;