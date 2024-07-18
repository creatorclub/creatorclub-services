const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

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
const UsersInterests = sequelize.define(
    "UsersInterests",
    {
      user_id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
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

// Function to migrate data
const migrateData = async () => {
    try {
        // Read Firestore JSON data
        const filePath = path.join('/Users/ketankamble/GitHub/creatorclub-services', 'updated_users.json');
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const firestoreData = JSON.parse(jsonData);

        // Extract relevant data and map to PostgreSQL columns
        const usersData = firestoreData.map(user => ({
            user_id: user.id,
            skills:user.skills,
            interest:user.interests,
            city:user.city,
            country:user.country
        }));

        // Insert data into PostgreSQL
        await sequelize.sync();
        for (const user of usersData) {
            console.log('data in line no 79', user);
            await UsersInterests.upsert(user, { returning: true });
            console.log(`Migrated user with ID: ${user.user_id}`);
        }

        console.log('Data migration completed successfully!');
    } catch (error) {
        console.error('Error migrating data:', error);
    } finally {
        await sequelize.close();
    }
};

// Run the migration
migrateData();