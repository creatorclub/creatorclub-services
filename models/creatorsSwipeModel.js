const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");


const ProfileSwipe = sequelize.define('ProfileSwipe', {
  profile_req_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  swiped_by: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  swiped_to: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue:"Pending"
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'creators_swipes_requests',
  timestamps: false,
});

module.exports = ProfileSwipe;
