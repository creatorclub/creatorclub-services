const Bookmarks = require("../../models/bookmarks/bookmarkModel");
const usersDetails = require("../../models/usersInfo/usersDetailsModel");
const usersInterest = require("../../models/usersInfo/usersInterestModel");
const { Op } = require("sequelize");

usersInterest.belongsTo(usersDetails, { foreignKey: "user_id" });
usersDetails.hasOne(usersInterest, { foreignKey: "user_id" });

const getAllUsersProfile = async (req, res) => {
  try {
    const users = await usersDetails.findAll({
      include: [
        {
          model: usersInterest,
          required: true,
        },
      ],
    });
    res.status(200).json({
      message: "Successfully fetched all profiles",
      status: 200,
      data: users,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to fetch",
      status: 500,
      data: [{}],
    });
  }
};

// const deleteUserProfile = (req, res) => {
//   const user_id = req.params.user_id;
//   if (!user_id) {
//     return res.status(400).json({ error: "user_id is required", status: 400 });
//   }
//   const query = "DELETE FROM users_profile WHERE user_id = $1";
//   const values = [user_id];
//   pool.query(query, values, (error, results) => {
//     if (error) throw error;
//     res.status(200).json({ message: "User deleted successfully", status: 200 });
//   });
// };

const upsertUserProfile = async (req, res) => {
  const user_id = req.params.user_id;

  var userNameExists = false;

  var {
    name,
    bio,
    userImageUrl,
    skills,
    interest,
    username,
    active_collab,
    social_account,
    collab_count,
    status,
    latitude,
    longitude,
    country,
    city,
    profile_background_image,
  } = req.body;

  username = username.replace(/\s+/g, '').toLowerCase();
  try {
    const userProfile = await usersDetails.findByPk(user_id);
    if (!userProfile) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }
    const validUsernamePattern = /^[a-z0-9_]+$/;
    if (!validUsernamePattern.test(username)) {
    return res
      .status(400)
      .json({ error: "Username can only contain numbers and underscores" });
  }

    var a;
    if (userProfile.dataValues.username === "") {
      a = username;
      userNameExists = true;
    }
    const updatedDetails = {
      name,
      bio,
      userImageUrl,
      active_collab,
      social_account,
      collab_count,
      status,
      username: a,
      profile_background_image,
    };
    const updatedInterests = {
      skills,
      interest,
      latitude,
      longitude,
      country,
      city,
    };

    const [updated] = await usersDetails.update(updatedDetails, {
      where: { user_id: user_id },
    });

    const [updatedOne] = await usersInterest.update(updatedInterests, {
      where: { user_id: user_id },
    });

    if (userNameExists) {
      return res.status(200).json({
        message: "User profile updated successfully",
        status: 200,
      });
    } else if (!userNameExists) {
      return res.status(200).json({
        message:
          "User profile updated successfully and username can't be changed once set",
        status: 200,
      });
    } else {
      return res
        .status(400)
        .json({ message: "No parameters passed in body", status: 400 });
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

const getProfileById = async (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required", status: 400 });
  }
  try {
    const users = await usersDetails.findOne({
      include: [
        {
          model: usersInterest,
          required: true,
          attributes: ["skills", "interest", "city", "country"],
        },
      ],
      where: { user_id },
    });

    if (users) {
      const userData = users.toJSON();
      const { UsersInterest } = userData;
      const mergedData = { ...userData, ...UsersInterest };
      delete mergedData.UsersInterest;

      return res.status(200).json({
        message: "User successfully fetched",
        status: 200,
        data: mergedData,
      });
    } else {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: 500,
      error: error.message,
    });
  }
};

const checkUsernameExists = async (req, res) => {
  var userName = req.params.userName;

  if (!userName) {
    return res
      .status(400)
      .json({ error: "Username query parameter is required" });
  }

  userName = userName.replace(/\s+/g, '').toLowerCase();

  const validUsernamePattern = /^[a-z0-9_]+$/;
    if (!validUsernamePattern.test(userName)) {
    return res
      .status(400)
      .json({ error: "Username can only contain numbers and underscores" });
  }

  try {
    const checkIfUserNameExists = await usersDetails.findOne({
      where: { username: userName },
    });

    const findAllUserNames = await usersDetails.findAll({
      attributes: ["username"],
    });

    console.log("first", findAllUserNames);

    const usernames = findAllUserNames.map((user) => user.username);

    console.log("second", usernames);

    if (checkIfUserNameExists) {
      return res
        .status(200)
        .json({
          message: "Username already exists",
          status: 200,
          data: usernames,
        });
    } else {
      return res
        .status(200)
        .json({ message: "Username available", status: 200, data: usernames });
    }
  } catch (error) {
    console.error("Error checking username:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllUsersProfile,
  getProfileById,
  upsertUserProfile,
  checkUsernameExists,
};
