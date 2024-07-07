const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, '/Users/ketankamble/Creators_Club_Prod_service_key/creatorclub-f1dcc-firebase-adminsdk-1m6vf-1f5d7365f9.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath)
});
const db = admin.firestore();
async function fetchUsers() {
  try {
    console.log('Connecting to Firestore...');
    const usersCollection = db.collection('Users');
    console.log('Fetching users from Firestore...');
    const snapshot = await usersCollection.get();
    if (snapshot.empty) {
      console.log('No matching documents found.');
      return;
    }
    let usersData = [];
    snapshot.forEach(doc => {
      console.log(`Document found with ID: ${doc.id}`);
      usersData.push({ id: doc.id, ...doc.data() });
    });
    const outputPath = path.resolve(__dirname, 'users.json');
    fs.writeFileSync(outputPath, JSON.stringify(usersData, null, 2));
    console.log(`Successfully written ${usersData.length} user records to users.json`);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}
// Call the function to fetch users and write to a JSON file
fetchUsers();