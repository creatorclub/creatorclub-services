const usersDetails = require("../../models/usersDetailsModel");
const usersInterest = require("../../models/usersInterestModel");
const CreatorsRequest = require('../../models/creatorsSwipeModel');
const {Op} =require('sequelize');

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
  const {
    name,
    bio,
    image_url,
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
  } = req.body;

  try {
    const userProfile = await usersDetails.findByPk(user_id);
    if (!userProfile) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }
    var a;
    if (userProfile.dataValues.username === "") {
      a = username;
    }
    const updatedDetails = {
      name,
      bio,
      image_url,
      active_collab,
      social_account,
      collab_count,
      status,
      username: a,
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
    if (updated || updatedOne) {
      return res.status(200).json({
        message: "User profile updated successfully",
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
          attributes: ['skills', 'interest', 'city', 'country']
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
module.exports = {
  getAllUsersProfile,
  getProfileById,
  upsertUserProfile,
};
