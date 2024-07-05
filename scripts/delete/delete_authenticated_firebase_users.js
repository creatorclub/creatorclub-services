const admin = require("firebase-admin");

// Path to your service account key file
const serviceAccount = require("/Users/adityarana/Documents/ServiceAccountKeys/CreatorClub/creatorclub-dev-firebase-adminsdk-85h94-6c17245d79.json");

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

// Function to delete users in batches
async function deleteAllUsers(nextPageToken) {
  // List users with pagination
  const listUsersResult = await auth.listUsers(1000, nextPageToken);
  
  const userIds = listUsersResult.users.map(user => user.uid);
  if (userIds.length > 0) {
    console.log(`Deleting ${userIds.length} users...`);
    // Delete users in batch
    const deleteResult = await auth.deleteUsers(userIds);
    console.log(`Successfully deleted ${deleteResult.successCount} users`);
    console.log(`Failed to delete ${deleteResult.failureCount} users`);
    
    // If there are more users to fetch, call the function recursively
    if (listUsersResult.pageToken) {
      await deleteAllUsers(listUsersResult.pageToken);
    }
  } else {
    console.log('No more users to delete.');
  }
}

// Start deleting users
deleteAllUsers()
  .then(() => console.log('Finished deleting all users.'))
  .catch(error => console.error('Error deleting users:', error));