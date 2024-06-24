const Collab = require("../../models/collaborations/collabsModel");
const usersDetails = require("../../models/usersInfo/usersDetailsModel");

const deleteCollab = (req, res) => {
  const collab_id = req.params.collab_id;

  if (!collab_id) {
    return res
      .status(400)
      .json({ error: "collab_id is required", status: 400 });
  }

  const query = "DELETE FROM collabs WHERE collab_id = $1";
  const values = [collab_id];

  pool.query(query, values, (error, results) => {
    if (error) throw error;
    res
      .status(202)
      .json({ message: "Collaboration deleted successfully", status: 202 });
  });
};

const getAllCollabs = async (req, res) => {
  try {
    const collabs = await Collab.findAll();
    res
      .status(200)
      .json({
        message: "All Collaboration Fetched successfully",
        status: 200,
        data: collabs,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", status: 500 });
  }
};

const updateCollab = async (req, res) => {
  const collab_id = req.params.collab_id;
  const fields = req.body;

  if (!collab_id) {
    return res.status(400).json({ error: "collab_id is required" });
  }

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: "No fields provided for update" });
  }

  try {
    const result = await Collab.update(fields, { where: { collab_id } });

    if (result[0] === 0) {
      return res
        .status(404)
        .json({ message: "Collaboration not found", status: 404 });
    }

    res
      .status(200)
      .json({ message: "Collaboration updated successfully", status: 200 });
  } catch (error) {
    console.error("Error executing query", error);
    res
      .status(500)
      .json({
        error: "An error occurred while updating the Collaboration",
        status: 500,
      });
  }
};

const createCollab = async (req, res) => {
  const {
    user_id,
    title,
    tags,
    description,
    collab_mode,
    payment,
    due_date,
    type,
    latitude,
    longitude,
    country,
    city,
    collabImageUrl,
  } = req.body;

  try {
    const user = await usersDetails.findOne({ where: { user_id } });

    if (!user) {
      return res.status(404).json({ message: "User not found", status: 404 });
    }
    
    const newCollab = await Collab.create({
      user_id,
      title,
      tags,
      description,
      collab_mode,
      payment,
      due_date,
      type,
      latitude,
      longitude,
      country,
      city,
      collabImageUrl,
    });

    

    const currentActiveCollab = user.active_collab || [];
    const updatedActiveCollab = [...currentActiveCollab, newCollab.collab_id];

    await usersDetails.update(
      { active_collab: updatedActiveCollab },
      { where: { user_id } }
    );

    res
      .status(201)
      .json({
        message: "Collaboration created successfully",
        status: 200,
        data: { Collab_ID: newCollab.collab_id },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", status: 500 });
  }
};

module.exports = { updateCollab, getAllCollabs, deleteCollab, createCollab };
