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
  const { records, interests } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const uniqueSet = new Set();
    const uniqueData = [];

    records.forEach((item) => {
      const identifier = `${item.swiped_to}-${item.collab_id}`;
      if (!uniqueSet.has(identifier)) {
        uniqueSet.add(identifier);
        uniqueData.push(item);
      }
    });

    console.log(uniqueData)

    var neglect_collabs = await ConnectedCollabs.findOne({
      where: { user_id: user_id },
    });

    if (!neglect_collabs) {
      const collabs = await Collabs.findAll({
        where: {
          user_id: {
            [Op.ne]: user_id,
          },
          collabImageUrl:{
            [Op.ne]: '',
            [Op.like]: 'https%'
          }
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
          collabImageUrl:{
            [Op.ne]: '',
            [Op.like]: 'https%'
          },
          tags: {
            [Op.contains]: interests,
          },
          is_visible: true,
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
        message: "Relevant collabs fetched succesfully",
        status: 200,
        data: modifiedCollabs,
      });
    } else {
      for (const { user_id, collab_id, action, timestamp } of uniqueData) {
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
        tags: {
          [Op.contains]: interests,
        },
        collabImageUrl:{
          [Op.ne]: '',
          [Op.like]: 'https%'
        },
        is_visible: true,
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
      message: "Relevant collabs updated and fetched succesfully",
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

module.exports = { getRelevantCollabs };
