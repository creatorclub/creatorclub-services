const userProfileModel = require("../../models/usersProfileModel");

const getAllUsersProfile = async (req, res) => {
  try {
    const users = await userProfileModel.findAll();
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
  const userId = req.params.user_id;
  const {
    name,
    bio,
    imageurl,
    skills,
    interest,
    username,
    active_collab,
    social_account,
    collab_count,
    user_description,
    latitude,
    longitude,
    country,
    city,
  } = req.body;

  try {
    const userProfile = await userProfileModel.findByPk(userId);

    if (!userProfile) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }
    const updateData = {
      name,
      bio,
      imageurl,
      skills,
      interest,
      active_collab,
      social_account,
      collab_count,
      user_description,
      latitude,
      longitude,
      country,
      city,
    };

    if (!userProfile.username) {
      updateData.username = username;
    }

    // Update the user profile
    const [updated] = await userProfileModel.update(updateData, {
      where: { user_id: userId },
    });
    if (updated) {
      await userProfileModel.findByPk(userId);
      return res.status(200).json({
        message: "User profile updated successfully",
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
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
    const user = await userProfileModel.findByPk(user_id);
    if (user) {
      return res.status(200).json({
        message: `Successfully fetched user ${user_id}`,
        status: 200,
        data: user,
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
