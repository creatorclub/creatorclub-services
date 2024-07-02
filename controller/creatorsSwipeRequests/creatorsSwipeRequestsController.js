const ConnectedCreators = require("../../models/creator model/creatorsSwipeRequests/connectedCreatorsModel");
const UsersPersonalDetails = require("../../models/usersInfo/usersPersonalDetailsModel.js");
const { sendPushNotification } = require("../../services/fcmServices.js");
const { Status } = require("./creatorsSwipeEnums");

const sendRequest = async (user_id, timestamp, swiped_to) => {
  try {
    const user = await ConnectedCreators.findByPk(user_id);
    const swipedToUser = await ConnectedCreators.findOne({
      where: { user_id: swiped_to },
    });

    if (!user) {
      await handleNewUserRequest(user_id, swiped_to, timestamp, swipedToUser);
      return { message: "New user created", status: 201 };
    }

    await handleExistingUserRequest(
      user_id,
      swiped_to,
      timestamp,
      swipedToUser
    );
    return { message: "Pending request updated", status: 200 };
  } catch (error) {
    console.error("Error sending request:", error);
    return { error: "An error occurred while sending request", status: 500 };
  }
};

const handleNewUserRequest = async (
  user_id,
  swiped_to,
  timestamp,
  swipedToUser
) => {
  if (!swipedToUser) {
    const newUser = await ConnectedCreators.create({ user_id: swiped_to });
    newUser.dataValues.inbox.push({ swiped_to: user_id, timestamp });
    await ConnectedCreators.update(
      { inbox: newUser.dataValues.inbox },
      { where: { user_id: swiped_to } }
    );
  } else {
    swipedToUser.dataValues.inbox.push({ swiped_to: user_id, timestamp });
    await ConnectedCreators.update(
      { inbox: swipedToUser.dataValues.inbox },
      { where: { user_id: swiped_to } }
    );
  }

  await ConnectedCreators.create({
    user_id,
    outbox: [{ swiped_to, timestamp }],
  });
};

const handleExistingUserRequest = async (
  user_id,
  swiped_to,
  timestamp,
  swipedToUser
) => {
  if (!swipedToUser) {
    const newUser = await ConnectedCreators.create({ user_id: swiped_to });
    newUser.dataValues.inbox.push({ swiped_to: user_id, timestamp });
    await ConnectedCreators.update(
      { inbox: newUser.dataValues.inbox },
      { where: { user_id: swiped_to } }
    );
  } else {
    swipedToUser.dataValues.inbox.push({ swiped_to: user_id, timestamp });
    await ConnectedCreators.update(
      { inbox: swipedToUser.dataValues.inbox },
      { where: { user_id: swiped_to } }
    );
  }

  const user = await ConnectedCreators.findByPk(user_id);
  user.dataValues.outbox.push({ swiped_to, timestamp });
  await ConnectedCreators.update(
    { outbox: user.dataValues.outbox },
    { where: { user_id } }
  );
};

const updateGroupAction = async (user_id, swiped_to, action, timestamp) => {
  try {
    const user = await ConnectedCreators.findByPk(user_id);
    const swipedToUser = await ConnectedCreators.findByPk(swiped_to);

    if (action === Status.ACCEPTED) {
      await handleAcceptAction(
        user,
        swipedToUser,
        user_id,
        swiped_to,
        timestamp
      );
      return { message: "User accepted successfully", status: 200 };
    }

    if (action === Status.REJECTED) {
      await handleRejectAction(
        user,
        swipedToUser,
        user_id,
        swiped_to,
        timestamp
      );
      return { message: "User rejected successfully", status: 200 };
    }

    return { message: "Invalid action", status: 400 };
  } catch (error) {
    console.error("Error updating action:", error);
    return { error: "An error occurred while updating action", status: 500 };
  }
};

const updateAction = async (req, res) => {
  const { user_id, swiped_to, action, timestamp } = req.body;

  try {
    const user = await ConnectedCreators.findByPk(user_id);
    const swipedToUser = await ConnectedCreators.findByPk(swiped_to);
    if (action === Status.ACCEPTED) {
      await handleAcceptAction(
        user,
        swipedToUser,
        user_id,
        swiped_to,
        timestamp
      );
      return res
        .status(200)
        .json({ message: "User accepted successfully", status: 200 });
    }

    if (action === Status.REJECTED) {
      await handleRejectAction(
        user,
        swipedToUser,
        user_id,
        swiped_to,
        timestamp
      );
      return res
        .status(200)
        .json({ message: "User rejected successfully", status: 200 });
    }

    return res.status(400).json({ message: "Invalid action", status: 400 });
  } catch (error) {
    console.error("Error updating action:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating action" });
  }
};

const handleAcceptAction = async (
  user,
  swipedToUser,
  user_id,
  swiped_to,
  timestamp
) => {
  user.dataValues.outbox = user.dataValues.outbox.filter(
    (item) => item.swiped_to !== swiped_to
  );
  user.dataValues.connected_users.push({ swiped_to, timestamp });
  await ConnectedCreators.update(
    {
      outbox: user.dataValues.outbox,
      connected_users: user.dataValues.connected_users,
    },
    { where: { user_id } }
  );

  swipedToUser.dataValues.inbox = swipedToUser.dataValues.inbox.filter(
    (item) => item.swiped_to !== user_id
  );
  swipedToUser.dataValues.connected_users.push({
    swiped_to: user_id,
    timestamp,
  });

  await ConnectedCreators.update(
    {
      inbox: swipedToUser.dataValues.inbox,
      connected_users: swipedToUser.dataValues.connected_users,
    },
    { where: { user_id: swiped_to } }
  );
  await sendNotificationToReceiver(swiped_to);

};

const handleRejectAction = async (
  user,
  swipedToUser,
  user_id,
  swiped_to,
  timestamp
) => {
  user.dataValues.outbox = user.dataValues.outbox.filter(
    (item) => item.swiped_to !== swiped_to
  );
  user.dataValues.rejected_users.push({ swiped_to, timestamp });
  await ConnectedCreators.update(
    {
      outbox: user.dataValues.outbox,
      rejected_users: user.dataValues.rejected_users,
    },
    { where: { user_id } }
  );

  swipedToUser.dataValues.inbox = swipedToUser.dataValues.inbox.filter(
    (item) => item.swiped_to !== user_id
  );
  swipedToUser.dataValues.rejected_users.push({
    swiped_to: user_id,
    timestamp,
  });
  await ConnectedCreators.update(
    {
      inbox: swipedToUser.dataValues.inbox,
      rejected_users: swipedToUser.dataValues.rejected_users,
    },
    { where: { user_id: swiped_to } }
  );
};

// const handleOnlyReject = async (
//   user_id,
//   swiped_to,
//   timestamp
// ) => {
//   const user = await ConnectedCreators.findByPk(user_id);
//     const swipedToUser = await ConnectedCreators.findByPk(swiped_to);
//   user.dataValues.rejected_users.push({ swiped_to, timestamp });
//   await ConnectedCreators.update(
//     {
//       rejected_users: user.dataValues.rejected_users,
//     },
//     { where: { user_id } }
//   );

//   swipedToUser.dataValues.rejected_users.push({
//     swiped_to: user_id,
//     timestamp,
//   });
//   await ConnectedCreators.update(
//     {
//       rejected_users: swipedToUser.dataValues.rejected_users,
//     },
//     { where: { user_id: swiped_to } }
//   );
// };

const sendNotificationToReceiver = async (swiped_to) => {
  try {
    const userDetails = await UsersPersonalDetails.findOne({
      where: { user_id: swiped_to },
      attributes: ["device_token"],
    });

    if (!userDetails || !userDetails.device_token) {
      console.log(`No device tokens found for user_id: ${swiped_to}`);
      return;
    }

    const deviceTokens = userDetails.device_token;
    const notificationTitle = "Someone is looking for your Profile";
    const notificationBody = "Let's check it out!";

    const additionalData = {};

    for (const token of deviceTokens) {
      await sendPushNotification(
        token,
        notificationTitle,
        notificationBody,
        additionalData
      );
    }

    console.log(`Notifications sent to all devices for user_id: ${swiped_to}`);
  } catch (error) {
    console.error(`Error sending notification: ${error.message}`);
  }
};
module.exports = {
  sendRequest,
  updateAction,
  updateGroupAction,
  sendNotificationToReceiver
};
