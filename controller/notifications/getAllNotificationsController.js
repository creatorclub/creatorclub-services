const ConnectedCollabs = require("../../models/collabsSwipeRequests/connectedCollabsModel.js");
const ConnectedCreators = require("../../models/creator model/creatorsSwipeRequests/connectedCreatorsModel.js");
const UsersDetails = require("../../models/usersInfo/usersDetailsModel.js");

const getAllInboxRequests = async (req, res) => {
  const user_id = req.params.user_id;

  if (!user_id) {
    return res
      .status(400)
      .json({ message: "User is required", status: 400, data: [] });
  }
  const allCollabsInbox = await ConnectedCollabs.findOne({
    where: { user_id: user_id },
    attributes: ["inbox"],
  });

  const allCreatorsInbox = await ConnectedCreators.findOne({
    where: { user_id: user_id },
    attributes: ["inbox"],
  });

  const addUserDetails = async (inbox) => {
    const swipedIds = inbox.map(obj => obj.swiped_to);
    const userDetails = await UsersDetails.findAll({
      where: {
        user_id: swipedIds
      },
      attributes: ['user_id', 'name', 'userImageUrl']
    });

    const userDetailsMap = userDetails.reduce((map, user) => {
      map[user.user_id] = { name: user.name, userImageUrl: user.userImageUrl };
      return map;
    }, {});

    return inbox.map(obj => ({
      ...obj,
      name: userDetailsMap[obj.swiped_to]?.name || '',
      userImageUrl: userDetailsMap[obj.swiped_to]?.userImageUrl || ''
    }));
  };

  let data = [];
  if (!allCreatorsInbox && allCollabsInbox) {

    data = await addUserDetails(allCollabsInbox.dataValues.inbox);
    data.forEach(obj => obj.is_collab = true);
  } else if (!allCollabsInbox && allCreatorsInbox) {
    data = await addUserDetails(allCreatorsInbox.dataValues.inbox);
    data.forEach(obj => obj.is_collab = false);
  } else if (allCreatorsInbox && allCollabsInbox) {
    let collabInbox = await addUserDetails(allCollabsInbox.dataValues.inbox);
    collabInbox.forEach(obj => obj.is_collab = true);
    
    let creatorInbox = await addUserDetails(allCreatorsInbox.dataValues.inbox);
    creatorInbox.forEach(obj => obj.is_collab = false);
    
    data = [...collabInbox, ...creatorInbox];
  }

  if (data.length === 0) {
    return res.status(200).json({
      message: "No pending collab and creators requests",
      status: 200,
      data: [],
    });
  }

  return res.status(200).json({
    message: "All requests fetched from creators and collabs inbox",
    status: 200,
    data: data,
  });

};

module.exports = { getAllInboxRequests };
