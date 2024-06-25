const collabs = require("../../models/collaborations/collabsModel");
const { Op } = require("sequelize");
const ConnectedCollabs = require("../../models/collabsSwipeRequests/connectedCollabsModel");

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
      const users = await usersDetails.findAll({
        include: [
          {
            model: usersInterest,
            required: true,
            attributes: ["skills", "interest", "city", "country"],
          },
        ],
        raw: true,
        nest: true,
      });

      const formattedUsers = users
        .filter((user) => user.user_id !== user_id)
        .map((user) => {
          const { UsersInterest, ...userWithoutInterest } = user;
          return {
            ...userWithoutInterest,
            ...UsersInterest,
          };
        });

      return res.status(200).json({
        message: "All records fetched",
        status: 200,
        data: formattedUsers,
      });
    }

    const rejected_profile = neglect_profiles.dataValues.rejected_users.map(
      (elem) => elem.swiped_to
    );

    const connected_users = neglect_profiles.dataValues.connected_users.map(
      (elem) => elem.swiped_to
    );

    const pending_users_request_sent =
      neglect_profiles.dataValues.pending_users_request_sent.map(
        (elem) => elem.swiped_to
      );

    const allProfilesToNeglect = [
      ...rejected_profile,
      ...connected_users,
      ...pending_users_request_sent,
    ];

    console.log("profiles to be neglected", allProfilesToNeglect);

    const profiles = await usersDetails.findAll({
      where: {
        user_id: {
          [Op.and]: [
            { [Op.notIn]: allProfilesToNeglect },
            { [Op.ne]: user_id },
          ],
        },
      },
      limit: 50,
      include: [
        {
          model: usersInterest,
          required: true,
          attributes: ["skills", "interest", "city", "country"],
        },
      ],
      raw: true,
      nest: true,
    });

    const formattedProfiles = profiles.map((profile) => {
      const { UsersInterest, ...profileWithoutInterest } = profile;
      return {
        ...profileWithoutInterest,
        ...UsersInterest,
      };
    });
    res.status(200).json({
      message: "Relevant Profiles fetched succesfully",
      status: 200,
      data: formattedProfiles,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching profiles" });
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
          newswipedtoUser.dataValues.my_pending_collabs_requests;
        updatedreq.push({ user_id, collab_id, timestamp });
        await ConnectedCollabs.update(
          { my_pending_collabs_requests: updatedreq },
          { where: { user_id: collabUser } }
        );
      } else {
        const updatedreq =
          userPresentInConnect.dataValues.my_pending_collabs_requests;
        updatedreq.push({ user_id, collab_id, timestamp });
        await ConnectedCollabs.update(
          { my_pending_collabs_requests: updatedreq },
          { where: { user_id: collabUser } }
        );
      }
      await ConnectedCollabs.create({
        user_id,
        pending_collab_request_sent: [
          {
            collabUserId: collabUser,
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
        var newswipedtoUser = await ConnectedCollabs.create({
          user_id: collabUser,
        });
        const updatedreq =
          newswipedtoUser.dataValues.my_pending_collabs_requests;
        updatedreq.push({ user_id, collab_id, timestamp });
        await ConnectedCollabs.update(
          { my_pending_collabs_requests: updatedreq },
          { where: { user_id: collabUser } }
        );
      } else {
        const updatedreq =
          userPresentInConnect.dataValues.my_pending_collabs_requests;
        updatedreq.push({ user_id, collab_id, timestamp });
        await ConnectedCollabs.update(
          { my_pending_collabs_requests: updatedreq },
          { where: { user_id: collabUser } }
        );
      }
      const pending_users_updated = users.dataValues.pending_users_request_sent;
      pending_users_updated.push({
        collabUserId: collabUser,
        collab_id,
        timestamp,
      });
      await ConnectedCollabs.update(
        { pending_users_request_sent: pending_users_updated },
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
    if (action === "Accepted") {
      // Move from pending_collab_request_sent to connected_collabs for the user
      let pendingCollabRequests =
        user.dataValues.pending_collab_request_sent || [];
      let updatedPendingCollabRequests = pendingCollabRequests.filter(
        (obj) => obj.user_id !== user_id || obj.collab_id !== collab_id
      );
      console.log(
        "Updated pending_collab_request_sent for user:",
        updatedPendingCollabRequests
      );
      let connectedCollabs = user.dataValues.connected_collabs || [];
      connectedCollabs.push({ collabUserId: collabUser, timestamp, collab_id });
      console.log("Updated connected_collabs for user:", connectedCollabs);
      await ConnectedCollabs.update(
        {
          pending_collab_request_sent: updatedPendingCollabRequests,
          connected_collabs: connectedCollabs,
        },
        { where: { user_id: user_id } }
      );
      // Move from my_pending_collabs_requests to connected_collabs for the collab user
      let pendingCollabRequestsForCollabUser =
        userPresentInConnect.dataValues.my_pending_collabs_requests || [];
      let updatedPendingCollabRequestsForCollabUser =
        pendingCollabRequestsForCollabUser.filter(
          (obj) => obj.user_id !== user_id || obj.collab_id !== collab_id
        );
      console.log(
        "Updated my_pending_collabs_requests for collab user:",
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
          my_pending_collabs_requests:
            updatedPendingCollabRequestsForCollabUser,
          connected_collabs: connectedCollabsForCollabUser,
        },
        { where: { user_id: collabUser } }
      );
      return res
        .status(200)
        .json({ message: "User accepted successfully", status: 200 });
    } else if (action === "Rejected") {
      let pendingCollabRequests =
        user.dataValues.pending_collab_request_sent || [];
      let updatedPendingCollabRequests = pendingCollabRequests.filter(
        (ele) => ele.collab_id !== collab_id
      );
      console.log(
        "Updated pending_collab_request_sent for user (Rejected):",
        updatedPendingCollabRequests
      );
      await ConnectedCollabs.update(
        { pending_collab_request_sent: updatedPendingCollabRequests },
        { where: { user_id: user_id } }
      );
      let rejectedCollabs = user.dataValues.rejected_collabs || [];
      rejectedCollabs.push({ userCollabId: collabUser, collab_id, timestamp });
      console.log("Updated rejected_collabs for user:", rejectedCollabs);
      await ConnectedCollabs.update(
        { rejected_collabs: rejectedCollabs },
        { where: { user_id: user_id } }
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
  getAcceptedProfiles,
};
