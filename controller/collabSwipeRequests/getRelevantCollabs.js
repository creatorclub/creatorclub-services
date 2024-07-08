const ConnectedCollabs = require("../../models/collabsSwipeRequests/connectedCollabsModel");
const { Op } = require("sequelize");
const Collabs = require("../../models/collaborations/collabsModel");

const {
  updateGroupAction,
  sendCollabRequest,
  sendNotificationToReceiver,
} = require("./collabSwipeRequestsController");
const { Status } = require("./collabsSwipeEnums");
const UsersDetails = require("../../models/usersInfo/usersDetailsModel");

const getRelevantCollabs = async (req, res) => {
  const user_id = req.params.user_id;
  const { records } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    var neglect_collabs = await ConnectedCollabs.findOne({
      where: { user_id: user_id },
    });

    if (!neglect_collabs) {
      const collabs = await Collabs.findAll({
        where: {
          user_id: {
            [Op.ne]: user_id,
          },
        },
        include: {
          model: UsersDetails,
          attributes: ["name", "userImageUrl", "username"],
        },
        limit: 50,
        raw: true,
        nest: true,
      });

      const modifiedCollabs = collabs.map((collab) => {
        const { UsersDetail, ...rest } = collab;
        return { ...rest, ...UsersDetail };
      });
      ConnectedCollabs.create({ user_id: user_id });

      return res.status(200).json({
        message: "All records fetched",
        status: 200,
        data: modifiedCollabs,
      });
    }

    if (records.length === 0) {
      const rejected_collabs = neglect_collabs.dataValues.rejected_collabs.map(
        (elem) => elem.swiped_to
      );

      const connected_collabs =
        neglect_collabs.dataValues.connected_collabs.map(
          (elem) => elem.swiped_to
        );

      const pending_collabs_request_sent =
        neglect_collabs.dataValues.outbox.map((elem) => elem.swiped_to);

      const reported_collabs_request =
        neglect_collabs.dataValues.reported_collabs.map(
          (elem) => elem.swiped_to
        );

      const allCollabsToNeglect = [
        ...rejected_collabs,
        ...connected_collabs,
        ...pending_collabs_request_sent,
        ...reported_collabs_request,
      ];

      console.log("profiles to be neglected", allCollabsToNeglect);

      const profiles = await Collabs.findAll({
        where: {
          user_id: {
            [Op.and]: [
              { [Op.notIn]: allCollabsToNeglect },
              { [Op.ne]: user_id },
            ],
          },
        },
        include: {
          model: UsersDetails,
          attributes: ["name", "userImageUrl", "username"],
        },
        limit: 50,
        raw: true,
        nest: true,
      });
      const modifiedCollabs = profiles.map((collab) => {
        const { UsersDetail, ...rest } = collab;
        return { ...rest, ...UsersDetail };
      });
      return res.status(200).json({
        message: "Relevant Profiles fetched succesfully",
        status: 200,
        data: modifiedCollabs,
      });
    } else {
      for (const { user_id, collab_id, action, timestamp } of records) {
        if (action === Status.PENDING) {
          const swipedToUserDetails = await Collabs.findByPk(collab_id);

          const swipedToUserID = swipedToUserDetails.dataValues.user_id;

          const sendCollabRequestResult = await sendCollabRequest(
            user_id,
            timestamp,
            collab_id
          );
          await sendNotificationToReceiver(swipedToUserID);
          if (
            sendCollabRequestResult.status !== 200 &&
            sendCollabRequestResult.status !== 201
          ) {
            console.error(
              `Error sending request for ${user_id} and ${swiped_to}:`,
              sendCollabRequestResult.error
            );
          } else {
            console.log("Users inserted successfully");
          }
        } else {
          await sendCollabRequest(user_id, timestamp, collab_id);
          const result = await updateGroupAction(
            user_id,
            collab_id,
            action,
            timestamp
          );
          if (result.status !== 200) {
            console.error(
              `Error updating rejected action for ${user_id} and ${swiped_to}:`,
              result.error
            );
          }
        }
      }
    }

    const neglect_collabs_updated = await ConnectedCollabs.findOne({
      where: { user_id: user_id },
    });

    const rejected_collabs =
      neglect_collabs_updated.dataValues.rejected_collabs.map(
        (elem) => elem.swiped_to
      );

    const connected_collabs =
      neglect_collabs_updated.dataValues.connected_collabs.map(
        (elem) => elem.swiped_to
      );

    const pending_collabs_request_sent =
      neglect_collabs_updated.dataValues.outbox.map((elem) => elem.swiped_to);

    const reported_collabs_request =
      neglect_collabs.dataValues.reported_collabs.map((elem) => elem.swiped_to);

    const allCollabsToNeglect = [
      ...rejected_collabs,
      ...connected_collabs,
      ...pending_collabs_request_sent,
      ...reported_collabs_request,
    ];

    const collabs = await Collabs.findAll({
      where: {
        user_id: {
          [Op.and]: [{ [Op.notIn]: allCollabsToNeglect }, { [Op.ne]: user_id }],
        },
      },
      include: {
        model: UsersDetails,
        attributes: ["name", "userImageUrl", "username"],
      },
      limit: 50,
      raw: true,
      nest: true,
    });
    const modifiedCollabs = collabs.map((collab) => {
      const { UsersDetail, ...rest } = collab;
      return { ...rest, ...UsersDetail };
    });
    return res.status(200).json({
      message: "Relevant Profiles updated and fetched succesfully",
      status: 200,
      data: modifiedCollabs,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching profiles" });
  }
};

const filterCollabs = async (req, res) => {
  const { interests } = req.body;
  const user_id = req.params.user_id;

  if (!Array.isArray(interests)) {
    return res
      .status(400)
      .json({ error: "Interests must be an array of strings" });
  }

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    var neglect_collabs = await ConnectedCollabs.findOne({
      where: { user_id: user_id },
    });

    if (!neglect_collabs) {
      const collabs = await Collabs.findAll({
        where: {
          user_id: {
            [Op.ne]: user_id,
          },
          tags: {
            [Op.contains]: interests,
          },
        },
        limit: 50,
      });

      return res.status(200).json({
        message: "Filtered collabs successfully",
        status: 200,
        data: collabs,
      });
    } else {
      const rejected_collabs = neglect_collabs.dataValues.rejected_collabs.map(
        (elem) => elem.swiped_to
      );

      const connected_collabs =
        neglect_collabs.dataValues.connected_collabs.map(
          (elem) => elem.swiped_to
        );

      const pending_collabs_request_sent =
        neglect_collabs.dataValues.outbox.map((elem) => elem.swiped_to);

      const allCollabsToNeglect = [
        ...rejected_collabs,
        ...connected_collabs,
        ...pending_collabs_request_sent,
      ];

      const profiles = await Collabs.findAll({
        where: {
          user_id: {
            [Op.and]: [
              { [Op.notIn]: allCollabsToNeglect },
              { [Op.ne]: user_id },
            ],
          },
          tags: {
            [Op.contains]: interests,
          },
        },
        limit: 50,
      });

      return res.status(200).json({
        message: "Filtered collabs fetched succesfully",
        status: 200,
        data: profiles,
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching matching users" });
  }
};
module.exports = { getRelevantCollabs, filterCollabs };
