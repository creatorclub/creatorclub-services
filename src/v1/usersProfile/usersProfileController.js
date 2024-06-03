const pool = require("../config/db");

const getAllUsersProfile = (req, res) => {
  pool.query(" SELECT * FROM users_profile", (error, results) => {
    if (error) throw error;

    res
      .status(200)
      .json({
        message: "Sucessfully fetched all users",
        status: 200,
        data: results.rows,
      });
  });
};

const deleteUserProfile = (req, res) => {
  const user_id = req.params.user_id;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required", status: 400 });
  }

  const query = "DELETE FROM users_profile WHERE user_id = $1";

  const values = [user_id];

  pool.query(query, values, (error, results) => {
    if (error) throw error;

    res.status(200).json({ message: "User deleted successfully", status: 200 });
  });
};

const createProfile = (req, res) => {
  const { user_id, name, location, imageURL, skills, interest } = req.body;

  const query = `
      UPDATE users_profile
      SET name = $1, location = $2, imageURL = $3, skills = $4, interest = $5
      WHERE user_id = $6
      RETURNING *;
  `;

  const values = [name, location, imageURL, skills, interest, user_id];

  pool.query(query, values, (error, results) => {
    if (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({
        message: "Internal Server Error",
        status: "500",
      });
    }

    if (results.rowCount === 0) {
      return res.status(404).json({
        message: "User not found",
        status: "404",
      });
    }

    return res.status(200).json({
      message: "User profile updated successfully",
      status: "200",
      data: results.rows[0],
    });
  });
};
const updateUsersProfile = (req, res) => {
  const userId = req.params.user_id;
  const {
    name,
    location,
    bio,
    imageurl,
    skills,
    interest,
    username,
    active_collab,
    social_account,
    collab_count,
    email,
  } = req.body;

  try {
    let updateQuery = "UPDATE users_profile SET ";
    const fields = [];
    const values = [];
    let index = 1;

    if (name !== undefined) {
      fields.push(`name = $${index}`);
      values.push(name);
      index++;
    }
    if (location !== undefined) {
      fields.push(`location = $${index}`);
      values.push(location);
      index++;
    }
    if (bio !== undefined) {
      fields.push(`bio = $${index}`);
      values.push(bio);
      index++;
    }
    if (imageurl !== undefined) {
      fields.push(`imageURL = $${index}`);
      values.push(imageurl);
      index++;
    }
    if (skills !== undefined) {
      fields.push(`skills = $${index}`);
      values.push(skills);
      index++;
    }
    if (interest !== undefined) {
      fields.push(`interest = $${index}`);
      values.push(interest);
      index++;
    }
    if (username !== undefined) {
      fields.push(`username = $${index}`);
      values.push(username);
      index++;
    }
    if (active_collab !== undefined) {
      fields.push(`active_collab = $${index}`);
      values.push(active_collab);
      index++;
    }
    if (social_account !== undefined) {
      fields.push(`social_account = $${index}`);
      values.push(social_account);
      index++;
    }
    if (collab_count !== undefined) {
      fields.push(`collab_count = $${index}`);
      values.push(collab_count);
      index++;
    }
    if (email !== undefined) {
      fields.push(`email = $${index}`);
      values.push(email);
      index++;
    }
    if (fields.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    updateQuery += fields.join(", ") + ` WHERE user_id = $${index}`;
    values.push(userId);

    pool.query(updateQuery, values);
    res.status(200).json({ message: "User profile updated successfully",status:200 });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllUsersProfile,

  deleteUserProfile,

  updateUsersProfile,
  createProfile,
};
