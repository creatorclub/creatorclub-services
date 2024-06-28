const collabs = require("../../models/collaborations/collabsModel");
const { Op } = require("sequelize");
const ConnectedCollabs = require("../../models/collabsSwipeRequests/connectedCollabsModel");
const collabsEnum=require('./collabsSwipeEnums');

const getRelevantCollabs = async (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const neglect_collabs = await ConnectedCollabs.findOne({
      where: { user_id: user_id },
    });

    let allCollabsToNeglect = [];
    if (neglect_collabs) {
      const { rejected_collabs, connected_collabs, outbox } =
        neglect_collabs.dataValues;

      const rejected_profile = rejected_collabs.map((elem) => elem.collab_id);
      const connected_users = connected_collabs.map((elem) => elem.collab_id);
      const pending_collabs_request_sent = outbox.map(
        (elem) => elem.collab_id
      );

      allCollabsToNeglect = [
        ...rejected_profile,
        ...connected_users,
        ...pending_collabs_request_sent,
      ];
    }

    const relevantCollabs = await collabs.findAll({
      where: {
        collab_id: {
          [Op.notIn]: allCollabsToNeglect,
        },
        user_id: {
          [Op.ne]: user_id,
        },
      },
      limit: 50,
    });

    res.status(200).json({
      message: "Relevant Profiles fetched successfully",
      status: 200,
      data: relevantCollabs,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ error: "An error occurred while fetching profiles" });
  }
};

const sendRequest = async (req, res) => {
  const { user_id, timestamp, collab_id } = req.body;

  const users = await ConnectedCollabs.findByPk(user_id);

  const userPresent = await collabs.findByPk(collab_id);

  const collabUser = userPresent.dataValues.user_id;

  const userPresentInConnect = await ConnectedCollabs.findByPk(collabUser);

  console.log("first", userPresent.dataValues.user_id);

  console.log("second", users);
  try {
    if (!users) {
      if (!userPresentInConnect) {
        var newswipedtoUser = await ConnectedCollabs.create({
          user_id: collabUser,
        });
        const updatedreq =
          newswipedtoUser.dataValues.inbox;
        updatedreq.push({ user_id, collab_id, timestamp });
        await ConnectedCollabs.update(
          { inbox: updatedreq },
          { where: { user_id: collabUser } }
        );
      } else {
        const updatedreq =
          userPresentInConnect.dataValues.inbox;
        updatedreq.push({ user_id, collab_id, timestamp });
        await ConnectedCollabs.update(
          { inbox: updatedreq },
          { where: { user_id: collabUser } }
        );
      }
      await ConnectedCollabs.create({
        user_id,
        outbox: [
          {
            user_id: collabUser,
            collab_id,
            timestamp,
          },
        ],
      });

      return res
        .status(201)
        .json({ message: "New Collab request Created", status: 201 });
    } else {
      if (!userPresentInConnect) {
        let newswipedtoUser = await ConnectedCollabs.create({
          user_id: collabUser,
        });
        let updatedreq =
          newswipedtoUser.dataValues.inbox;
        updatedreq.push({ user_id, collab_id, timestamp });
        await ConnectedCollabs.update(
          { inbox: updatedreq },
          { where: { user_id: collabUser } }
        );
      } else {
        let updatedreq =
          userPresentInConnect.dataValues.inbox;
        updatedreq.push({ user_id, collab_id, timestamp });
        await ConnectedCollabs.update(
          { inbox: updatedreq },
          { where: { user_id: collabUser } }
        );
      }
      const pending_collab_updated = users.dataValues.outbox;
      pending_collab_updated.push({
        user_id: collabUser,
        collab_id,
        timestamp,
      });
      await ConnectedCollabs.update(
        { outbox: pending_collab_updated },
        { where: { user_id: user_id } }
      );
      return res
        .status(200)
        .json({ message: "Pending request updated", status: 201 });
    }
  } catch (error) {
    res.status(500).json({ message: error, status: 500 });
  }
};

const updateAction = async (req, res) => {
  const { user_id, collab_id, action, timestamp } = req.body;
  try {
    const user = await ConnectedCollabs.findByPk(user_id);
    const userPresent = await collabs.findByPk(collab_id);
    if (!user || !userPresent) {
      return res
        .status(400)
        .json({ message: "User or collab doesn't exist", status: 400 });
    }
    const collabUser = userPresent.dataValues.user_id;
    const userPresentInConnect = await ConnectedCollabs.findByPk(collabUser);
    if (!userPresentInConnect) {
      return res
        .status(400)
        .json({
          message: "User doesn't exist for entered collab id",
          status: 400,
        });
    }
    if (action === collabsEnum.status.accepted_status) {
      let pendingCollabRequests =
        user.dataValues.outbox || [];
      let updatedPendingCollabRequests = pendingCollabRequests.filter(
        (obj) => obj.user_id !== collabUser && obj.collab_id !== collab_id
      );
      console.log(
        "Updated outbox for user:",
        updatedPendingCollabRequests
      );
      let connectedCollabs = user.dataValues.connected_collabs || [];
      connectedCollabs.push({ user_id: collabUser, timestamp, collab_id });
      console.log("Updated connected_collabs for user:", connectedCollabs);
      await ConnectedCollabs.update(
        {
          outbox: updatedPendingCollabRequests,
          connected_collabs: connectedCollabs,
        },
        { where: { user_id: user_id } }
      );
      let pendingCollabRequestsForCollabUser =
        userPresentInConnect.dataValues.inbox || [];
      let updatedPendingCollabRequestsForCollabUser =
        pendingCollabRequestsForCollabUser.filter(
          (obj) => obj.user_id !== user_id || obj.collab_id !== collab_id
        );
      console.log(
        "Updated inbox for collab user:",
        updatedPendingCollabRequestsForCollabUser
      );
      let connectedCollabsForCollabUser =
        userPresentInConnect.dataValues.connected_collabs || [];
      connectedCollabsForCollabUser.push({ user_id, timestamp, collab_id });
      console.log(
        "Updated connected_collabs for collab user:",
        connectedCollabsForCollabUser
      );
      await ConnectedCollabs.update(
        {
          inbox:
            updatedPendingCollabRequestsForCollabUser,
          connected_collabs: connectedCollabsForCollabUser,
        },
        { where: { user_id: collabUser } }
      );
      return res
        .status(200)
        .json({ message: "User accepted successfully", status: 200 });
    } else if (action === collabsEnum.status.rejected_status) {
      let pendingCollabRequests =
        user.dataValues.outbox || [];
      let updatedPendingCollabRequests = pendingCollabRequests.filter(
        (obj) => obj.user_id !== collabUser && obj.collab_id !== collab_id
      );
      console.log(
        "Updated outbox for user:",
        updatedPendingCollabRequests
      );
      let rejectedCollabs = user.dataValues.rejected_collabs || [];
      rejectedCollabs.push({ user_id: collabUser, timestamp, collab_id });
      console.log("Updated connected_collabs for user:", rejectedCollabs);
      await ConnectedCollabs.update(
        {
          outbox: updatedPendingCollabRequests,
          rejected_collabs: rejectedCollabs,
        },
        { where: { user_id: user_id } }
      );
      let pendingCollabRequestsForCollabUser =
        userPresentInConnect.dataValues.inbox || [];
      let updatedPendingCollabRequestsForCollabUser =
        pendingCollabRequestsForCollabUser.filter(
          (obj) => obj.user_id !== user_id || obj.collab_id !== collab_id
        );
      console.log(
        "Updated inbox for collab user:",
        updatedPendingCollabRequestsForCollabUser
      );
      let rejectedCollabsForCollabUser =
        userPresentInConnect.dataValues.rejected_collabs || [];
      rejectedCollabsForCollabUser.push({ user_id, timestamp, collab_id });
      console.log(
        "Updated connected_collabs for collab user:",
        rejectedCollabsForCollabUser
      );
      await ConnectedCollabs.update(
        {
          inbox:
            updatedPendingCollabRequestsForCollabUser,
          rejected_collabs: rejectedCollabsForCollabUser,
        },
        { where: { user_id: collabUser } }
      );
      return res
        .status(200)
        .json({ message: "User rejected successfully", status: 200 });
    } else {
      return res
        .status(400)
        .json({ message: "Action doesn't exist", status: 400 });
    }
  } catch (error) {
    console.error("Error in updateAction:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", status: 500 });
  }
};
module.exports = {
  sendRequest,
  updateAction,
  getRelevantCollabs
};