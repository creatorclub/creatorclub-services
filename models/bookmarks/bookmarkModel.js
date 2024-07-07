const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Bookmarks = sequelize.define(
    "Bookmarks",
    {
        user_id:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        bookmarks:{
            type:DataTypes.JSON,
            defaultValue:[]
        }
    },
    {
        tableName: "bookmarks",
        timestamps: false,
      }
)

module.exports = Bookmarks;
