const { Sequelize, DataTypes } = require('sequelize');
// Initialize Sequelize with explicit dialect
const sequelize = new Sequelize('verceldb', 'default', 'GwItRQ3b9UjE', {
  host: 'ep-wandering-resonance-a4o9ohci-pooler.us-east-1.aws.neon.tech',
  dialect: 'postgres',
  dialectOptions: {
    ssl:"true",
    
  },
  dialectModule: require("pg"), // Set the dialect explicitly
});
const UsersPersonalDetails = sequelize.define('UsersPersonalDetails', {
    user_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    device_token: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'users',
    timestamps: false
  });
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

// Function to create missing collaboration requests
async function addMissingBookmarks() {
  try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');

      // Get all user IDs from the users table
      const users = await UsersPersonalDetails.findAll({
          attributes: ['user_id']
      });

      const userIds = users.map(user => user.user_id);

      // Get all user IDs already in the bookmarks table
      const existingBookmarks = await Bookmarks.findAll({
          attributes: ['user_id']
      });

      const existingUserIds = existingBookmarks.map(bookmark => bookmark.user_id);

      // Filter out user IDs that already have bookmarks
      const newUserIds = userIds.filter(userId => !existingUserIds.includes(userId));

      // Create new bookmark entries for users without bookmarks
      const newBookmarks = newUserIds.map(userId => ({
          user_id: userId,
          bookmarks: []
      }));

      console.log("first",newBookmarks)

      await Bookmarks.bulkCreate(newBookmarks);

      console.log('New bookmarks have been added successfully.');
  } catch (error) {
      console.error('Unable to connect to the database:', error);
  } finally {
      await sequelize.close();
  }
}

// Execute the function
addMissingBookmarks();