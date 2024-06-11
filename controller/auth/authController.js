
const UserProfile = require('../../models/usersProfileModel');

const AuthenticateUser = async (req, res) => {
  const { user_id, email } = req.body;

  if (!user_id) {
    return res.status(400).json({
      message: "User ID is required",
      status: 400,
    });
  }

  try {
    const existingUser = await UserProfile.findOne({ where: { user_id } });

    if (existingUser) {
      return res.status(200).json({
        message: "User verified",
        status: 200,
        data: existingUser
      });
    }

    const existingUserByEmail = await UserProfile.findOne({ where: { email } });

    if (existingUserByEmail) {
      return res.status(400).json({
        message: "Email already exists",
        status: 400,
      });
    }


    const newUser = await UserProfile.create({ user_id, email });
    res.status(201).json({
      message: "User ID created",
      status: 201,
      data: newUser
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      message: "Internal Server Error",
      status: 500,
    });
  }
};

module.exports = { AuthenticateUser };
