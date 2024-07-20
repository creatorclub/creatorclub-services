const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

// Database connection setup
const sequelize = new Sequelize(
    'vercel_prod_CC',        // Database name
    'postgres',      // Username
    'ketan',   // Password
    {
        host: 'localhost',  // Host
        dialect: 'postgres' // Explicitly specify the dialect
    }
);
// Define UsersPersonalDetails model
const UsersDetails = sequelize.define(
  "UsersDetails",{
    user_id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
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
      userImageUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue:""
      },
      profile_background_image: {
        type: DataTypes.TEXT,
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
      },
      dob:{
        type:DataTypes.DATE,
      },
      hide_all_collab :{
        type: DataTypes.BOOLEAN,
        defaultValue : false,
        allowNull:false
      }
    },
  { tableName: "user_details", timestamps: false }
);

// Function to migrate data
const migrateData = async () => {
  try {
    // Read Firestore JSON data
    const filePath = path.join('/Users/ketankamble/GitHub/creatorclub-services', 'updated_users.json');
    const jsonData = fs.readFileSync(filePath, "utf8");
    const firestoreData = JSON.parse(jsonData);

    // Extract relevant data and map to PostgreSQL columns
    const usersData = firestoreData.map((user) => ({
      user_id: user.id,
      name: user.Name,
      bio: user.bio,
      status: user.status,
      userImageUrl: user.profileimage,
      profile_background_image: user.coverimage,
      collab_count: user.noOfPosts,
      username: user.username,
    }));

    // Insert data into PostgreSQL
    await sequelize.sync();
    for (const user of usersData) {
      await UsersDetails.upsert(user, { returning: true });
      console.log(`Migrated user with ID: ${user.user_id}`);
    }

    console.log("Data migration completed successfully!");
  } catch (error) {
    console.error("Error migrating data:", error);
  } finally {
    await sequelize.close();
  }
};

// Run the migration
migrateData();