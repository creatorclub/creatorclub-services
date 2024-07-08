const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Database connection setup
const sequelize = new Sequelize(
    'dev-cc',        // Database name
    'postgres',      // Username
    'welcomeOOPS',   // Password
    {
        host: 'localhost',  // Host
        dialect: 'postgres' // Explicitly specify the dialect
    }
);

// Define the Collab model as per your specifications
const Collab = sequelize.define('Collab', {
    collab_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    latitude: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    longitude: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    city: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    country: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    collab_mode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    payment: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bookmark_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    collabImageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'collabs',
    timestamps: false,
});

// Function to convert dd/mm/yyyy to JavaScript Date
function convertToDate(dateString) {
    try {
        const [day, month, year] = dateString.split('/');
        const date = new Date(`${year}-${month}-${day}`);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
        return date;
    } catch (error) {
        console.error(`Invalid date format: ${dateString}`);
        return null;
    }
}

// Function to migrate JSON data to SQL
async function migrateData() {
    try {
        // Read the JSON file
        const filePath = path.join('/Users/adityarana/Documents/CC-MIgration', 'posts.json');
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const collabs = JSON.parse(jsonData);

        // Loop through each JSON object and map to SQL model
        for (const collabData of collabs) {
            const dueDate = convertToDate(collabData.dueDate);
            if (!dueDate) {
                console.error(`Skipping entry with invalid date: ${collabData.dueDate}`);
                continue;
            }

            const mappedData = {
                user_id: collabData.userid,
                title: collabData.title,
                latitude: collabData.locationMap?.latitude?.toString() || "",
                longitude: collabData.locationMap?.longitude?.toString() || "",
                city: collabData.location?.split(",")[0].trim() || "",
                country: collabData.countryIsoCode || "",
                tags: collabData.tags2,
                description: collabData.description,
                collab_mode: collabData.where,
                payment: collabData.pay,
                due_date: dueDate,
                type: collabData.type,
                collabImageUrl: collabData.image
            };

            // Save the mapped data to the SQL database
            await Collab.create(mappedData);
            console.log(`Migrated collab with title: ${collabData.title}`);
        }

        console.log('Data migration completed successfully!');
    } catch (error) {
        console.error('Error during migration:', error);
    }
}

// Call the migration function with the JSON file path
migrateData();