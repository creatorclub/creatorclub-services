const { Op } = require("sequelize");
const ConnectedCreators = require("../../models/creator model/creatorsSwipeRequests/connectedCreatorsModel");
const UsersDetails = require("../../models/usersInfo/usersDetailsModel");

const getAllConnectedUsers = async (req, res) => {
  const user_id = req.params.user_id;

  if (!user_id) {
    return res
      .status(400)
      .json({ message: "Enter a valid user_id", status: 400 });
  }

  try {
    const result = await ConnectedCreators.findOne({
      where: { user_id: user_id },
      attributes: ["connected_users"],
    });

    if (!result) {
      return res
        .status(404)
        .json({ message: "No connected users found", status: 404 });
    }

    const connectedUsers = result.dataValues.connected_users;

    const getAllUsers = connectedUsers.map((ele) => ele.swiped_to);

    const findUserDetails = await UsersDetails.findAll({
      where: {
        user_id: {
          [Op.in]: getAllUsers,
        },
      },
      attributes:["name","userImageUrl","user_id"]
    });

    const userDetailsMap = {};
    findUserDetails.forEach((user) => {
      userDetailsMap[user.user_id] = {
        name: user.name,
        userImageUrl: user.userImageUrl,
      };
    });

    const updatedConnectedUsers = connectedUsers.map((user) => {
      const details = userDetailsMap[user.swiped_to];
      return {
        ...user,
        name: details ? details.name : null,
        image_url: details ? details.userImageUrl : null,
      };
    });


    return res.status(200).json({
      message: "Connected users fetched",
      status: 200,
      data: updatedConnectedUsers,
    });
  } catch (error) {
    console.error("Error sending request:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while sending request" });
  }
};

module.exports = { getAllConnectedUsers };
