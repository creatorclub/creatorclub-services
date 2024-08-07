const UserPersonalDetail = require("../../models/usersInfo/usersPersonalDetailsModel");
const usersDetails = require("../../models/usersInfo/usersDetailsModel");
const usersInterest = require("../../models/usersInfo/usersInterestModel");
const Bookmarks = require("../../models/bookmarks/bookmarkModel");
const ConnectedCollabs = require("../../models/collabsSwipeRequests/connectedCollabsModel");
const ConnectedCreators = require("../../models/creator model/creatorsSwipeRequests/connectedCreatorsModel");

const AuthenticateUser = async (req, res) => {
  const { user_id, email, device_token } = req.body;

  if (!user_id) {
    return res.status(400).json({
      message: "User ID is required",
      status: 400,
    });
  }

  try {
    const existingUser = await UserPersonalDetail.findOne({
      where: { user_id },
    });

    if (existingUser) {
      return res.status(200).json({
        message: "User verified",
        status: 200,
        data: existingUser,
      });
    }

    const existingUserByEmail = await UserPersonalDetail.findOne({
      where: { email },
    });

    if (existingUserByEmail) {
      return res.status(400).json({
        message: "Email already exists",
        status: 400,
      });
    }

    const newUser = await UserPersonalDetail.create({
      user_id,
      email,
      device_token,
    });

    await usersDetails.create({ user_id });

    await usersInterest.create({ user_id });

    await Bookmarks.create({ user_id });

    await ConnectedCollabs.create({ user_id });

    await ConnectedCreators.create({ user_id });

    res.status(201).json({
      message: "User ID created",
      status: 201,
      data: newUser,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      message: "Internal Server Error",
      status: 500,
    });
  }
};

const updateDeviceToken = async (req, res) => {
  const user_id = req.params.user_id;
  const { device_token } = req.body;

  const latest_version = "2.1.1";
  const forced_update = false;
  try {
    if (!user_id) {
      return res
        .status(400)
        .json({ message: "User ID is required", status: 400 });
    }

    if (device_token !== "") {
      const getUserDetails = await UserPersonalDetail.findByPk(user_id);

      const newDeviceTokenArray = getUserDetails.dataValues.device_token;

      newDeviceTokenArray.push(device_token);

      await UserPersonalDetail.update(
        { device_token: newDeviceTokenArray },
        { where: { user_id: user_id } }
      );

      return res.status(200).json({
        message: "App health successfully checked",
        status: 200,
        data: {
          latest_version: latest_version,
          forced_update: forced_update,
          device_token: "Device token updated successfully",
        },
      });
    } else {
      return res.status(200).json({
        message: "App health successfully checked",
        status: 200,
        data: {
          latest_version: latest_version,
          forced_update: forced_update,
          device_token: "",
        },
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Error connecting to server ${err}`,
      status: 400,
    });
  }
};

module.exports = { AuthenticateUser, updateDeviceToken };
