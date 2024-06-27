const { Op } = require("sequelize");
const UserDetails = require("../../models/usersInfo/usersDetailsModel");
const ConnectedCreators = require("../../models/creatorsSwipeRequests/connectedCreatorsModel");
const { Status } = require("./creatorsSwipeEnums");

const getAcceptedProfiles = async (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const neglect_profiles = await ConnectedCreators.findOne({
      where: { user_id: user_id },
    });

    if (!neglect_profiles) {
      const users = await UserDetails.findAll({
        where: {
          user_id: {
            [Op.ne]: user_id,
          },
        },
      });

      return res.status(200).json({
        message: "All records fetched",
        status: 200,
        data: users,
      });
    }

    const rejected_profile = neglect_profiles.dataValues.rejected_users.map(
      (elem) => elem.swiped_to
    );

    const connected_users = neglect_profiles.dataValues.connected_users.map(
      (elem) => elem.swiped_to
    );

    const pending_users_request_sent = neglect_profiles.dataValues.outbox.map(
      (elem) => elem.swiped_to
    );

    const allProfilesToNeglect = [
      ...rejected_profile,
      ...connected_users,
      ...pending_users_request_sent,
    ];

    console.log("profiles to be neglected", allProfilesToNeglect);

    const profiles = await UserDetails.findAll({
      where: {
        user_id: {
          [Op.and]: [
            { [Op.notIn]: allProfilesToNeglect },
            { [Op.ne]: user_id },
          ],
        },
      },
      limit: 50,
    });

    res.status(200).json({
      message: "Relevant Profiles fetched succesfully",
      status: 200,
      data: profiles,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching profiles" });
  }
};

const getAllConnectedUsers=async(req,res)=>{
  const user_id=req.params.user_id;

  if(!user_id){
    return res.status(400).json({message:"Enter a valid user_id",status:400})
  }

  try{
    const result = await ConnectedCreators.findOne({
      where: { user_id: user_id },
      attributes: ['connected_users']
    });

    if (!result) {
      return res.status(404).json({ message: "No connected users found", status: 404 });
    }

    const connectedUsers = result.dataValues.connected_users;

    return res.status(200).json({
      message: "Connected users fetched",
      status: 200,
      data: connectedUsers
    });
  }
  catch (error) {
    console.error("Error sending request:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while sending request" });
  }
}

const sendRequest = async (req, res) => {
  const { user_id, timestamp, swiped_to } = req.body;

  try {
    const user = await ConnectedCreators.findByPk(user_id);
    const swipedToUser = await ConnectedCreators.findOne({
      where: { user_id: swiped_to },
    });

    if (!user) {
      await handleNewUserRequest(user_id, swiped_to, timestamp, swipedToUser);
      return res.status(201).json({ message: "New user created", status: 201 });
    }

    await handleExistingUserRequest(
      user_id,
      swiped_to,
      timestamp,
      swipedToUser
    );
    return res
      .status(200)
      .json({ message: "Pending request updated", status: 200 });
  } catch (error) {
    console.error("Error sending request:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while sending request" });
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

module.exports = {
  getAcceptedProfiles,
  sendRequest,
  updateAction,
  getAllConnectedUsers
};
