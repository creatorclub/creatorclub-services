const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CollabSwipe = sequelize.define('CollabSwipe', {
  collab_req_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  swiper_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  swiped_to_id:{
    type:DataTypes.STRING,
    allowNull:false
  },
  collab_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue:"Pending"
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'collaborations_swipes_requests',
  timestamps: false,
});

module.exports = CollabSwipe;
