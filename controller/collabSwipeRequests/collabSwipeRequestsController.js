const ConnectedCollabs = require("../../models/collabsSwipeRequests/connectedCollabsModel.js");
const collabs = require("../../models/collaborations/collabsModel.js");
const UsersPersonalDetails = require("../../models/usersInfo/usersPersonalDetailsModel.js");
const { sendPushNotification } = require("../../services/fcmServices.js");
const { Status } = require("./collabsSwipeEnums.js");

const sendCollabRequest = async (user_id, timestamp, collab_id) => {
  try {
    const user = await ConnectedCollabs.findByPk(user_id);
    console.log("user one", user);

    const swipedToUserDetails = await collabs.findByPk(collab_id);

    console.log("first", swipedToUserDetails);

    const swipedToUserID = swipedToUserDetails.dataValues.user_id;

    console.log("swipedToUserID", swipedToUserID);

    const swipedToUser = await ConnectedCollabs.findOne({
      where: { user_id: swipedToUserID },
    });
    console.log("swipedToUser", swipedToUser);

    if (!user) {
      await handleNewCollabRequest(
        user_id,
        timestamp,
        swipedToUserID,
        swipedToUser,
        collab_id
      );
      return { message: "New user created", status: 201 };
    }

    await handleExistingCollabRequest(
      user_id,
      timestamp,
      swipedToUserID,
      swipedToUser,
      collab_id
    );
    return { message: "Pending request updated", status: 200 };
  } catch (error) {
    console.error("Error sending request:", error);
    return { error: "An error occurred while sending request", status: 500 };
  }
};

const handleNewCollabRequest = async (
  user_id,
  timestamp,
  swipedToUserID,
  swipedToUser,
  collab_id
) => {
  console.log(
    `user_id ${user_id}  timestamp ${timestamp} swipedToUserID ${swipedToUserID} swipedToUser ${swipedToUser} collab_id ${collab_id}`
  );
  if (!swipedToUser) {
    const newUser = await ConnectedCollabs.create({ user_id: swipedToUserID });
    newUser.dataValues.inbox.push({
      swiped_to: user_id,
      timestamp: timestamp,
      collab_id: collab_id,
    });
    await ConnectedCollabs.update(
      { inbox: newUser.dataValues.inbox },
      { where: { user_id: swipedToUserID } }
    );
  } else {
    console.log("From swiped to function", swipedToUser);
    swipedToUser.dataValues.inbox.push({
      swiped_to: user_id,
      timestamp: timestamp,
      collab_id: collab_id,
    });
    await ConnectedCollabs.update(
      { inbox: swipedToUser.dataValues.inbox },
      { where: { user_id: swipedToUserID } }
    );
  }

  await ConnectedCollabs.create({
    user_id,
    outbox: [{ swiped_to: swipedToUserID, timestamp, collab_id }],
  });
};

const handleExistingCollabRequest = async (
  user_id,
  timestamp,
  swipedToUserID,
  swipedToUser,
  collab_id
) => {
  if (!swipedToUser) {
    const newUser = await ConnectedCollabs.create({ user_id: swipedToUserID });
    newUser.dataValues.inbox.push({
      swiped_to: user_id,
      timestamp: timestamp,
      collab_id: collab_id,
    });
    await ConnectedCollabs.update(
      { inbox: newUser.dataValues.inbox },
      { where: { user_id: swipedToUserID } }
    );
  } else {
    swipedToUser.dataValues.inbox.push({
      swiped_to: user_id,
      timestamp: timestamp,
      collab_id: collab_id,
    });
    await ConnectedCollabs.update(
      { inbox: swipedToUser.dataValues.inbox },
      { where: { user_id: swipedToUserID } }
    );
  }

  const user = await ConnectedCollabs.findByPk(user_id);
  user.dataValues.outbox.push({
    swiped_to: swipedToUserID,
    timestamp: timestamp,
    collab_id: collab_id,
  });
  await ConnectedCollabs.update(
    { outbox: user.dataValues.outbox },
    { where: { user_id } }
  );
};

const updateGroupAction = async (user_id, collab_id, action, timestamp) => {
  try {
    const user = await ConnectedCollabs.findByPk(user_id);

    const swipedToUserDetails = await collabs.findByPk(collab_id);

    const swipedToUserID = swipedToUserDetails.dataValues.user_id;

    const swipedToUser = await ConnectedCollabs.findOne({
      where: { user_id: swipedToUserID },
    });

    if (action === Status.ACCEPTED) {
      await handleAcceptAction(
        user,
        swipedToUser,
        user_id,
        swipedToUserID,
        timestamp,
        collab_id
      );
      await sendNotificationToReceiver(swipedToUserID);
      return { message: "User accepted successfully", status: 200 };
    }

    if (action === Status.REJECTED) {
      await handleRejectAction(
        user,
        swipedToUser,
        user_id,
        swipedToUserID,
        timestamp,
        collab_id
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
  const { user_id, collab_id, action, timestamp } = req.body;

  try {
    const user = await ConnectedCollabs.findByPk(user_id);

    const swipedToUserDetails = await collabs.findByPk(collab_id);

    const swipedToUserID = swipedToUserDetails.dataValues.user_id;

    const swipedToUser = await ConnectedCollabs.findOne({
      where: { user_id: swipedToUserID },
    });

    if (action === Status.ACCEPTED) {
      await handleAcceptAction(
        user,
        swipedToUser,
        user_id,
        swipedToUserID,
        timestamp,
        collab_id
      );
      // await sendNotificationToReceiver(swiped_to);
      return res
        .status(200)
        .json({ message: "User accepted successfully", status: 200 });
    }

    if (action === Status.REJECTED) {
      await handleRejectAction(
        user,
        swipedToUser,
        user_id,
        swipedToUserID,
        timestamp,
        collab_id
      );
      // await sendNotificationToReceiver(swiped_to);
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

const removeOneMatch = (arr, collab_user_id, collab_id_to_block) => {
  const index = arr.findIndex(
    (ele) => ele.swiped_to === collab_user_id && ele.collab_id === collab_id_to_block
  );
  if (index !== -1) {
    arr.splice(index, 1);
  }
  return arr;
};

const handleAcceptAction = async (
  user,
  swipedToUser,
  user_id,
  swipedToUserID,
  timestamp,
  collab_id
) => {
  user.dataValues.outbox = removeOneMatch(user.dataValues.outbox,swipedToUserID,collab_id);
  user.dataValues.connected_collabs.push({
    swiped_to: swipedToUserID,
    collab_id: collab_id,
    timestamp: timestamp,
  });
  await ConnectedCollabs.update(
    {
      outbox: user.dataValues.outbox,
      connected_collabs: user.dataValues.connected_collabs,
    },
    { where: { user_id } }
  );
  swipedToUser.dataValues.inbox = removeOneMatch(swipedToUser.dataValues.inbox,user_id,collab_id);

  swipedToUser.dataValues.connected_collabs.push({
    swiped_to: user_id,
    collab_id: collab_id,
    timestamp,
  });

  await ConnectedCollabs.update(
    {
      inbox: swipedToUser.dataValues.inbox,
      connected_collabs: swipedToUser.dataValues.connected_collabs,
    },
    { where: { user_id: swipedToUserID } }
  );

  await sendNotificationToReceiver(swipedToUserID);
};

const handleRejectAction = async (
  user,
  swipedToUser,
  user_id,
  swipedToUserID,
  timestamp,
  collab_id
) => {
  user.dataValues.outbox = removeOneMatch(user.dataValues.outbox,swipedToUserID,collab_id);

  user.dataValues.rejected_collabs.push({
    swiped_to: swipedToUserID,
    timestamp: timestamp,
    collab_id: collab_id,
  });
  await ConnectedCollabs.update(
    {
      outbox: user.dataValues.outbox,
      rejected_collabs: user.dataValues.rejected_collabs,
    },
    { where: { user_id } }
  );
  swipedToUser.dataValues.inbox = removeOneMatch(swipedToUser.dataValues.outbox,user_id,collab_id);

  swipedToUser.dataValues.rejected_collabs.push({
    swiped_to: user_id,
    timestamp,
    collab_id: collab_id,
  });
  await ConnectedCollabs.update(
    {
      inbox: swipedToUser.dataValues.inbox,
      rejected_collabs: swipedToUser.dataValues.rejected_collabs,
    },
    { where: { user_id: swipedToUserID } }
  );
};
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
    const notificationTitle = "Someone is interested in your collab";
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

module.exports = { sendCollabRequest, updateAction, updateGroupAction,sendNotificationToReceiver };
