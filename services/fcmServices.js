require('dotenv').config();
const admin = require('firebase-admin');

const base64ServiceAccount = process.env.SERVICE_ACCOUNT_KEY;
const serviceAccountJson = Buffer.from(base64ServiceAccount, 'base64').toString('utf8');
const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendPushNotification(token, title, body, data = {}) {
  const message = {
    token: token,
    notification: {
      title: title,
      body: body
    },
    data: data,
    android: {
      priority: "high",
      notification: {
        sound: "default",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          contentAvailable: true,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

module.exports = {
  sendPushNotification
};
