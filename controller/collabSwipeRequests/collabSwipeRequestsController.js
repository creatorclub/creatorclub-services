const ConnectedCollabs = require("../../models/collabsSwipeRequests/connectedCollabsModel.js");
const collabs = require("../../models/collaborations/collabsModel.js");
const { sendPushNotification } = require("../../services/fcmServices.js");
const { Status } = require("./collabsSwipeEnums.js");

const sendCollabRequest = async (req,res) => {

  const {user_id, timestamp, collab_id}=req.body;

  try {
    const user = await ConnectedCollabs.findByPk(user_id);
    console.log("user one",user);

    const swipedToUserDetails = await collabs.findByPk(collab_id);

    console.log("first",swipedToUserDetails);

    const swipedToUserID = swipedToUserDetails.dataValues.user_id;

    console.log("swipedToUserID",swipedToUserID);

    const swipedToUser = await ConnectedCollabs.findOne({
      where: { user_id: swipedToUserID },
    });
    console.log("swipedToUser",swipedToUser)

    if (!user) {
      await handleNewCollabRequest(
        user_id,
  timestamp,
  swipedToUserID,
  swipedToUser,
  collab_id
      );
      return res.status(200).json({message:"New user created",status:200})
    }

    await handleExistingCollabRequest(
      user_id,
      timestamp,
      swipedToUserID,
      swipedToUser,
      collab_id
    );
    return res.status(200).json({message:"user updated!",status:200});
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
  console.log(`user_id ${user_id}  timestamp ${timestamp} swipedToUserID ${swipedToUserID} swipedToUser ${swipedToUser} collab_id ${collab_id}`)
  if (!swipedToUser) {
    const newUser = await ConnectedCollabs.create({ user_id: swipedToUserID });
    newUser.dataValues.inbox.push({ swiped_to: user_id, timestamp:timestamp,collab_id:collab_id });
    await ConnectedCollabs.update(
      { inbox: newUser.dataValues.inbox },
      { where: { user_id: swipedToUserID } }
    );
  } else {
    console.log("From swiped to function",swipedToUser);
    swipedToUser.dataValues.inbox.push({ swiped_to: user_id, timestamp:timestamp,collab_id:collab_id  });
    await ConnectedCollabs.update(
      { inbox: swipedToUser.dataValues.inbox },
      { where: { user_id: swipedToUserID } }
    );
  }

  await ConnectedCollabs.create({
    user_id,
    outbox: [{ swiped_to:swipedToUserID, timestamp,collab_id }],
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
    newUser.dataValues.inbox.push({ swiped_to: user_id, timestamp:timestamp,collab_id:collab_id });
    await ConnectedCollabs.update(
      { inbox: newUser.dataValues.inbox },
      { where: { user_id: swipedToUserID } }
    );
  } else {
    swipedToUser.dataValues.inbox.push({ swiped_to: user_id, timestamp:timestamp,collab_id:collab_id });
    await ConnectedCollabs.update(
      { inbox: swipedToUser.dataValues.inbox },
      { where: { user_id: swipedToUserID } }
    );
  }

  const user = await ConnectedCollabs.findByPk(user_id);
  user.dataValues.outbox.push({ swiped_to:swipedToUserID, timestamp:timestamp,collab_id:collab_id });
  await ConnectedCollabs.update(
    { outbox: user.dataValues.outbox },
    { where: { user_id } }
  );
};

const updateGroupAction = async (user_id, swiped_to, action, timestamp) => {
  try {
    const user = await collabs.findByPk(user_id);
    const swipedToUser = await collabs.findByPk(swiped_to);

    if (action === Status.ACCEPTED) {
      await handleAcceptAction(
        user,
        swipedToUser,
        user_id,
        swiped_to,
        timestamp
      );
      // await sendNotificationToReceiver(swiped_to);
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
      // await sendNotificationToReceiver(swiped_to);
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
      await sendNotificationToReceiver(swiped_to);
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
        swipedToUserID,
        timestamp,
        collab_id
) => {
  user.dataValues.outbox = user.dataValues.outbox.filter(
    (item) => item.swiped_to !== swipedToUserID
  );
  user.dataValues.connected_users.push({ swiped_to:swipedToUserID,collab_id:collab_id, timestamp:timestamp });
  await collabs.update(
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

  await collabs.update(
    {
      inbox: swipedToUser.dataValues.inbox,
      connected_users: swipedToUser.dataValues.connected_users,
    },
    { where: { user_id: swipedToUserID } }
  );
};

const handleRejectAction = async (
  user,
        swipedToUser,
        user_id,
        swipedToUserID,
        timestamp,
        collab_id
) => {
  user.dataValues.outbox = user.dataValues.outbox.filter(
    (item) => item.swiped_to !== swipedToUserID
  );
  user.dataValues.rejected_users.push({ swiped_to:swipedToUserID, timestamp:timestamp,collab_id:collab_id });
  await collabs.update(
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
  await collabs.update(
    {
      inbox: swipedToUser.dataValues.inbox,
      rejected_users: swipedToUser.dataValues.rejected_users,
    },
    { where: { user_id: swipedToUserID } }
  );
};

module.exports = {sendCollabRequest};
