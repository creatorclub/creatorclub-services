const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
    'vercel_prod_CC',        // Database name
    'postgres',      // Username
    'ketan',   // Password
    {
        host: 'localhost',  // Host
        dialect: 'postgres' // Explicitly specify the dialect
    }
);



// Define the ConnectedCreators model
const ConnectedCreators = sequelize.define("ConnectedCreators", {
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true,
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
  blocked_user: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  reported_user: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  communicated_user: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: "creators_swipe_requests",
  timestamps: false,
});

const UsersPersonalDetails = sequelize.define(
    "UsersPersonalDetails",
    {
      user_id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
      },
      device_token: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue:[]
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    { tableName: "users", timestamps: false }
  );

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
        userImageUrl: {
          type: DataTypes.STRING(255),
          allowNull: true,
          defaultValue:""
        },
        profile_background_image: {
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



sequelize.sync({ alter: true }).then(() => {
    console.log('Database & tables updated or created!');
  });

// ConnectedCreators.belongsTo(UsersDetails, { foreignKey: 'user_id' });
// UsersDetails.hasMany(ConnectedCreators, { foreignKey: 'user_id' });

// Function to insert data into the database
async function insertData(data) {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    for (const item of data) {
      const userId = item.users[0];
      const connectedUserId = item.users[1];

      // Check if user already exists
      const user = await UsersDetails.findOrCreate({
        where: { user_id: userId },
        defaults: { user_id: userId }
      });

      // Insert or update the ConnectedCreators record
      await ConnectedCreators.findOrCreate({
        where: { user_id: userId },
        defaults: {
          user_id: userId,
          connected_users: [connectedUserId]
        },
        update: {
          $push: {
            connected_users: connectedUserId
          }
        }
      });
    }
    console.log('Data has been inserted successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

// Sample NoSQL data

// Call the function to insert data
insertData(data);