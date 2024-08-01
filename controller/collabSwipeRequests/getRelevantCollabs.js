const ConnectedCollabs = require("../../models/collabsSwipeRequests/connectedCollabsModel");
const { Op } = require("sequelize");
const Collabs = require("../../models/collaborations/collabsModel");
const Bookmarks = require("../../models/bookmarks/bookmarkModel");
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
    if (records.length === 0) {
      await getUpdatedRelevantCollabs(interests, res, user_id);
    } else {
      await updateSwipeRecords(uniqueData, res, user_id);
      await getUpdatedRelevantCollabs(interests, res, user_id);
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching profile",
      status: 400,
    });
  }
};
const updateSwipeRecords = async (uniqueData, res, ) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching profile",
      status: 400,
    });
  }
};
const getUpdatedRelevantCollabs = async (interests, res, user_id) => {
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    var neglect_collabs = await ConnectedCollabs.findOne({
      where: { user_id: user_id },
    });
    const outbox_requests_data = neglect_collabs.dataValues.outbox.map(
      (elem) => elem.collab_id
    );
    const rejected_collabs_data =
      neglect_collabs.dataValues.rejected_collabs.map((elem) => elem.collab_id);
    const connected_collabs_data =
      neglect_collabs.dataValues.connected_collabs.map(
        (elem) => elem.collab_id
      );
    const reported_collabs_data =
      neglect_collabs.dataValues.reported_collabs.map((elem) => elem.collab_id);
    const allCollabsToNeglect = [
      ...outbox_requests_data,
      ...rejected_collabs_data,
      ...connected_collabs_data,
      ...reported_collabs_data,
    ];
    const uniqueArray = [...new Set(allCollabsToNeglect)];
    const collabs = await Collabs.findAll({
      where: {
        user_id: { [Op.ne]: user_id },
        collab_id: { [Op.notIn]: uniqueArray },
        collabImageUrl: {
          [Op.ne]: "",
          [Op.like]: "https://firebasestorage%",
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
      raw: true,
      nest: true,
    });
    const modifiedCollabs = collabs.map((collab) => {
      const { UsersDetail, ...rest } = collab;
      return { ...rest, ...UsersDetail };
    });
    const getBookmarkedCollab = await Bookmarks.findOne({
      where: { user_id: user_id },
    });
    const bookmarks = getBookmarkedCollab ? getBookmarkedCollab.dataValues.bookmarks : [];
    const updatedCollabsWithUserDetails = modifiedCollabs.map(collab => {
      const bookmarkExists = bookmarks.some(
        (bookmark) => String(bookmark.collab_id) === String(collab.collab_id)
      );
      return {
        ...collab,
        is_bookmarked: bookmarkExists
      };
    });

    return res.status(200).json({
      message: "Relevant collabs updated and fetched succesfully",
      status: 200,
      data: updatedCollabsWithUserDetails,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({
      message: "An error occurred while fetching profile",
      status: 400,
    });
  }
};
module.exports = { getRelevantCollabs };
