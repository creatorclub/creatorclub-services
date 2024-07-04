const Collab = require("../../models/collaborations/collabsModel");
const ConnectedCollabs = require("../../models/collabsSwipeRequests/connectedCollabsModel");
const usersDetails = require("../../models/usersInfo/usersDetailsModel");
const { Op } = require("sequelize");


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
    const collabs = await Collab.findAll({
      include: {
        model: usersDetails,
        attributes: ["userImageUrl", "username", "name"],
      },
    });

    const collabsWithUserDetails = collabs.map((collab) => {
      const userDetail = collab.UsersDetail
        ? collab.UsersDetail.dataValues
        : {};
      const { UsersDetail, ...collabData } = collab.dataValues;
      return {
        ...collabData,
        userImageUrl: userDetail.userImageUrl,
        username: userDetail.username,
        name: userDetail.name,
      };
    });

    res.status(200).json({
      message: "All Collaboration Fetched successfully",
      status: 200,
      data: collabsWithUserDetails,
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
    res.status(500).json({
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

    res.status(201).json({
      message: "Collaboration created successfully",
      status: 200,
      data: { Collab_ID: newCollab.collab_id },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", status: 500 });
  }
};

const getMyCollabs = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    const getAllCollabsofUser = await Collab.findAll({
      where: { user_id: user_id },
      attributes: [
        "collab_id",
        "collabImageUrl",
        "tags",
        "due_date",
        "type",
        "collab_mode",
        "payment",
        "country",
        "city",
      ],
      include: {
        model: usersDetails,
        attributes: ["name","bio", "username", "userImageUrl","status"],
      },
      raw: true,
      nest: true,
    });

    const connectedCollabs = await ConnectedCollabs.findOne({
      where: { user_id: user_id },
      attributes: ["inbox"],
      raw: true,
    });

    const swipedToUserIds = connectedCollabs
      ? connectedCollabs.inbox.map((inboxEntry) => inboxEntry.swiped_to)
      : [];

    const swipedToUsers = await usersDetails.findAll({
      where: {
        user_id: {
          [Op.in]: swipedToUserIds,
        },
      },
      attributes: ["user_id", "name","username"],
      raw: true,
    });

    const swipedToUserMap = swipedToUsers.reduce((acc, user) => {
      acc[user.user_id] = { name: user.name, username: user.username,user_id:user.user_id };
      return acc;
    }, {});

    const transformedResponse = getAllCollabsofUser.map((collab) => {
      const { UsersDetail, ...rest } = collab;
      const interested_list = connectedCollabs
        ? connectedCollabs.inbox.map((inboxEntry) => ({
            user_id:swipedToUserMap[inboxEntry.swiped_to]?.user_id || "",
            name: swipedToUserMap[inboxEntry.swiped_to]?.name || "",
            username: swipedToUserMap[inboxEntry.swiped_to]?.username || ""
          }))
        : [];
      console.log("swipedToUsers", interested_list);

      return {
        ...rest,
        bio: UsersDetail.bio,
        username: UsersDetail.username,
        userImageUrl: UsersDetail.userImageUrl,
        status:UsersDetail.status,
        is_visible: true,
        name:UsersDetail.name,
        interested_list,
      };
    });
    

    res.send({
      message: "All collabs fetched successfully",
      status: 200,
      data: {
        my_posts: transformedResponse,
        saved_posts: {
          collab_id: 0,
          collabImageUrl: "",
          tags: [],
          due_date: "",
          type: "",
          collab_mode: "",
          payment: "",
          country: "",
          city: "",
          bio: "",
          username: "",
          userImageUrl: "",
        },
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching collabs." });
  }
};

const getCollabById=async(req,res)=>{
  const collab_id=req.params.collab_id;

  if (!collab_id || collab_id.trim() === "") {
    return res.status(400).json({ status:400,message: "Collab ID is required" });
  }
  const getCollabByid=await Collab.findOne({where:{collab_id:collab_id}})

  if(!getCollabByid){
    return res.status(200).json({message:"No such collab exists",status:200,data:[]})
  }
  return res.status(200).json({message:"Collab fetched successfully",status:200,data:getCollabByid.dataValues})

}
module.exports = {
  updateCollab,
  getAllCollabs,
  deleteCollab,
  createCollab,
  getMyCollabs,
  getCollabById
};
