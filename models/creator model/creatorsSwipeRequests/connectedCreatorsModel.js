const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const UsersDetails = require("../../usersInfo/usersDetailsModel");

const ConnectedCreators = sequelize.define(
  "ConnectedCreators",
  {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: UsersDetails,
        key: 'user_id'
      }
    },
    connected_users: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    rejected_users: {
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
    blocked_user:{
      type:DataTypes.JSON,
      defaultValue:[]
    },
    reported_user:{
      type:DataTypes.JSON,
      defaultValue:[]
    },
    communicated_user:{
      type:DataTypes.JSON,
      defaultValue:[]
    }
  },
  {
    tableName: "creators_swipe_requests",
    timestamps: false,
  }
);

ConnectedCreators.belongsTo(UsersDetails, { foreignKey: 'user_id' });
UsersDetails.hasMany(ConnectedCreators, { foreignKey: 'user_id' });

module.exports = ConnectedCreators;
