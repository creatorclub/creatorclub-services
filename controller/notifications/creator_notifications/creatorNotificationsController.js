const ConnectedCreators = require("../../../models/creator model/creatorsSwipeRequests/connectedCreatorsModel");

const getAllInboxRequests = async (req, res) => {
  const  user_id  = req.params.user_id;

  if (!user_id) {
    return res
      .status(400)
      .json({ message: "User is required", status: 400, data: [] });
  }
  const allInboxRequests = await ConnectedCreators.findOne({
    where: { user_id: user_id },
    attributes: ["inbox"],
  });

  return res
    .status(200)
    .json({
      message: "All requests fetched from inbox",
      status: 200,
      data: allInboxRequests.dataValues.inbox,
    });
};

module.exports = { getAllInboxRequests };
