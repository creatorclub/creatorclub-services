const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const UsersDetails = require("../usersInfo/usersDetailsModel");

const ConnectedCollabs = sequelize.define(
  "ConnectedCollabs",
  {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: UsersDetails,
        key: 'user_id'
      }
    },
    connected_collabs: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    rejected_collabs: {
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
    reported_collabs:{
      type:DataTypes.JSON,
      defaultValue:[]
    }
  },
  {
    tableName: "collaborations_swipe_requests",
    timestamps: false,
  }
);

ConnectedCollabs.belongsTo(UsersDetails, { foreignKey: 'user_id' });
UsersDetails.hasMany(ConnectedCollabs, { foreignKey: 'user_id' });

module.exports = ConnectedCollabs;
