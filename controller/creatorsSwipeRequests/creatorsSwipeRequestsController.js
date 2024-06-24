const usersDetails = require("../../models/usersInfo/usersDetailsModel");
const { Op } = require("sequelize");
const ConnectedCreators = require("../../models/creatorsSwipeRequests/connectedCreatorsModel");
const usersInterest = require("../../models/usersInfo/usersInterestModel");
const creatorsEnums=require("./creatorsSwipeEnums");

const getAcceptedProfiles = async (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const neglect_profiles = await ConnectedCreators.findOne({
      where: { user_id: user_id },
    });

    if (!neglect_profiles) {
      const users = await usersDetails.findAll({
        include: [
          {
            model: usersInterest,
            required: true,
            attributes: ["skills", "interest", "city", "country"],
          },
        ],
        raw: true,
        nest: true,
      });

      const formattedUsers = users
        .filter((user) => user.user_id !== user_id) 
        .map((user) => {
          const { UsersInterest, ...userWithoutInterest } = user;
          return {
            ...userWithoutInterest,
            ...UsersInterest,
          };
        });

      return res
        .status(200)
        .json({
          message: "All records fetched",
          status: 200,
          data: formattedUsers,
        });
    }

    const rejected_profile = neglect_profiles.dataValues.rejected_users.map(
      (elem) => elem.swiped_to
    );

    const connected_users = neglect_profiles.dataValues.connected_users.map(
      (elem) => elem.swiped_to
    );

    const pending_users_request_sent =
      neglect_profiles.dataValues.pending_users_request_sent.map(
        (elem) => elem.swiped_to
      );

    const allProfilesToNeglect = [
      ...rejected_profile,
      ...connected_users,
      ...pending_users_request_sent,
    ];

    console.log("profiles to be neglected", allProfilesToNeglect);

    const profiles = await usersDetails.findAll({
      where: {
        user_id: {
          [Op.and]: [
            { [Op.notIn]: allProfilesToNeglect },
            { [Op.ne]: user_id },
          ],
        },
      },
      limit: 50,
      include: [
        {
          model: usersInterest,
          required: true,
          attributes: ["skills", "interest", "city", "country"],
        },
      ],
      raw: true,
      nest: true,
    });

    const formattedProfiles = profiles.map((profile) => {
      const { UsersInterest, ...profileWithoutInterest } = profile;
      return {
        ...profileWithoutInterest,
        ...UsersInterest,
      };
    });
    res.status(200).json({
      message: "Relevant Profiles fetched succesfully",
      status: 200,
      data: formattedProfiles,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching profiles" });
  }
};

const sendRequest = async (req, res) => {
  const { user_id, timestamp, swiped_to } = req.body;
  const users = await ConnectedCreators.findByPk(user_id);

  const userPresent = await ConnectedCreators.findOne({
    where: { user_id: swiped_to },
  });

  console.log("first", userPresent);

  console.log("second", users);
  try {
    if (!users) {
      if (!userPresent) {
        var newswipedtoUser = await ConnectedCreators.create({
          user_id: swiped_to,
        });
        const updatedreq = newswipedtoUser.dataValues.my_pending_users_requests;
        updatedreq.push({user_id,timestamp});
        await ConnectedCreators.update(
          { my_pending_users_requests: updatedreq },
          { where: { user_id: swiped_to } }
        );
      } else {
        const updatedreq = userPresent.dataValues.my_pending_users_requests;
        updatedreq.push({user_id,timestamp});
        await ConnectedCreators.update(
          { my_pending_users_requests: updatedreq },
          { where: { user_id: swiped_to } }
        );
      }
      await ConnectedCreators.create({
        user_id,
        pending_users_request_sent: [
          {
            swiped_to,
            timestamp,
          },
        ],
      });

      return res.status(201).json({ message: "New user Created", status: 201 });
    } else {
      if (!userPresent) {
        var newswipedtoUser = await ConnectedCreators.create({
          user_id: swiped_to,
        });
        const updatedreq = newswipedtoUser.dataValues.my_pending_users_requests;
        updatedreq.push({user_id,timestamp});
        await ConnectedCreators.update(
          { my_pending_users_requests: updatedreq },
          { where: { user_id: swiped_to } }
        );
      } else {
        const updatedreq = userPresent.dataValues.my_pending_users_requests;
        updatedreq.push({user_id,timestamp});
        await ConnectedCreators.update(
          { my_pending_users_requests: updatedreq },
          { where: { user_id: swiped_to } }
        );
      }
      const pending_users_updated = users.dataValues.pending_users_request_sent;
      pending_users_updated.push({
        swiped_to,
        timestamp,
      });
      await ConnectedCreators.update(
        { pending_users_request_sent: pending_users_updated },
        { where: { user_id: user_id } }
      );
      return res
        .status(200)
        .json({ message: "Pending request updated", status: 201 });
    }
  } catch (error) {
    res.status(500).json({ message: error, status: 500 });
  }
};


const updateAction = async (req, res) => {
  const { user_id, swiped_to, action, timestamp } = req.body;
  const user = await ConnectedCreators.findByPk(user_id); 
  if (action === creatorsEnums.status.accepted_status) {
    const deleteUser = user.dataValues.pending_users_request_sent;
    const deletedUser = deleteUser.filter((ele) => {
      return ele.swiped_to !== swiped_to;
    });
    console.log("first", deletedUser);
    await ConnectedCreators.update(
      { pending_users_request_sent: deletedUser },
      { where: { user_id: user_id } }
    );
    const connected_users_updated = user.dataValues.connected_users;
    connected_users_updated.push({
      swiped_to,
      timestamp,
    });
    await ConnectedCreators.update(
      { connected_users: connected_users_updated },
      { where: { user_id: user_id } }
    );
    return res
      .status(200)
      .json({ message: "User Accepted successfully", status: 200 });
  } else if (action === creatorsEnums.status.rejected_status) {
    const deleteUser = user.dataValues.pending_users_request_sent;
    const deletedUser = deleteUser.filter((ele) => {
      return ele.swiped_to !== swiped_to;
    });
    console.log("first", deletedUser);
    await ConnectedCreators.update(
      { pending_users_request_sent: deletedUser },
      { where: { user_id: user_id } }
    );
    const rejected_users_updated = user.dataValues.rejected_users;
    rejected_users_updated.push({
      swiped_to,
      timestamp,
    });
    await ConnectedCreators.update(
      { rejected_users: rejected_users_updated },
      { where: { user_id: user_id } }
    );
    return res
      .status(200)
      .json({ message: "User rejected successfully", status: 200 });
  } else {
    return res
      .status(400)
      .json({ message: "action doesn't exists", status: 400 });
  }
};

module.exports = {
  sendRequest,
  updateAction,
  getAcceptedProfiles,
};
