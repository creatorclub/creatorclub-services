const UserDetails = require("../../models/usersInfo/usersDetailsModel");
const UsersInterests = require("../../models/usersInfo/usersInterestModel");
const ConnectedCreators = require("../../models/creator model/creatorsSwipeRequests/connectedCreatorsModel");
const { Op } = require("sequelize");
const {
  updateGroupAction,
  sendRequest,
  sendNotificationToReceiver,
} = require("./creatorsSwipeRequestsController");
const { Status } = require("./creatorsSwipeEnums");

const getRelevantProfiles = async (req, res) => {
  const user_id = req.params.user_id;
  const { records, skills, interest } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const uniqueSet = new Set();
    const uniqueData = [];

    records.forEach((item) => {
      const { swiped_to } = item;
      if (!uniqueSet.has(swiped_to)) {
        uniqueSet.add(swiped_to);
        uniqueData.push(item);
      }
    });

    console.log(uniqueData)
    var neglect_profiles = await ConnectedCreators.findOne({
      where: { user_id: user_id },
    });

    if (!neglect_profiles) {
      const users = await UserDetails.findAll({
        where: {
          user_id: {
            [Op.ne]: user_id,
          },
        },
        include: [
          {
            model: UsersInterests,
            attributes: [
              "latitude",
              "longitude",
              "city",
              "country",
              "skills",
              "interest",
            ],
          },
        ],
      });

      ConnectedCreators.create({ user_id: user_id });

      return res.status(200).json({
        message: "All records fetched",
        status: 200,
        data: users,
      });
    }

    if (records.length === 0) {
      const rejected_profile = neglect_profiles.dataValues.rejected_users.map(
        (elem) => elem.swiped_to
      );

      const connected_users = neglect_profiles.dataValues.connected_users.map(
        (elem) => elem.swiped_to
      );

      const pending_users_request_sent = neglect_profiles.dataValues.outbox.map(
        (elem) => elem.swiped_to
      );

      const blocked_user = neglect_profiles.dataValues.blocked_user.map(
        (ele) => ele.swiped_to
      );

      const reported_user = neglect_profiles.dataValues.reported_user.map(
        (ele) => ele.swiped_to
      );

      const communicated_user =
        neglect_profiles.dataValues.communicated_user.map(
          (ele) => ele.swiped_to
        );

      const allProfilesToNeglect = [
        ...rejected_profile,
        ...connected_users,
        ...pending_users_request_sent,
        ...blocked_user,
        ...reported_user,
        ...communicated_user,
      ];

      console.log("profiles to be neglected", allProfilesToNeglect);

      const whereClause = {
        user_id: {
          [Op.and]: [
            { [Op.notIn]: allProfilesToNeglect },
            { [Op.ne]: user_id },
          ],
        },
      };

      const includeClause = [
        {
          model: UsersInterests,
          attributes: [
            "latitude",
            "longitude",
            "city",
            "country",
            "skills",
            "interest",
          ],
        },
      ];

      if (skills.length > 0 || interest.length > 0) {
        includeClause[0].where = {
          [Op.or]: [
            {
              skills: {
                [Op.overlap]: skills,
              },
            },
            {
              interest: {
                [Op.overlap]: interest,
              },
            },
          ],
        };
      }

      const profiles = await UserDetails.findAll({
        where: whereClause,
        include: includeClause,
        limit: 50,
      });

      return res.status(200).json({
        message: "Relevant Profiles fetched successfully",
        status: 200,
        data: profiles,
      });
    } else {
      for (const { user_id, swiped_to, action, timestamp } of uniqueData) {
        if (action === Status.PENDING) {
          console.log("i was here");
          const sendRequestResult = await sendRequest(
            user_id,
            timestamp,
            swiped_to
          );
          await sendNotificationToReceiver(swiped_to);
          if (
            sendRequestResult.status !== 200 &&
            sendRequestResult.status !== 201
          ) {
            console.error(
              `Error sending request for ${user_id} and ${swiped_to}:`,
              sendRequestResult.error
            );
          } else {
            console.log("Users inserted successfully");
          }
        } else {
          await sendRequest(user_id, timestamp, swiped_to);
          const result = await updateGroupAction(
            user_id,
            swiped_to,
            action,
            timestamp
          );
          if (result.status !== 200) {
            console.error(
              `Error updating rejected action for ${user_id} and ${swiped_to}:`,
              result.error
            );
          }
        }
      }
    }

    console.log("first", neglect_profiles.dataValues);

    const neglect_profiles_updated = await ConnectedCreators.findOne({
      where: { user_id: user_id },
    });

    const rejected_profile =
      neglect_profiles_updated.dataValues.rejected_users.map(
        (elem) => elem.swiped_to
      );

    const connected_users =
      neglect_profiles_updated.dataValues.connected_users.map(
        (elem) => elem.swiped_to
      );

    const pending_users_request_sent =
      neglect_profiles_updated.dataValues.outbox.map((elem) => elem.swiped_to);

    const blocked_user = neglect_profiles_updated.dataValues.blocked_user.map(
      (ele) => ele.swiped_to
    );

    const reported_user = neglect_profiles_updated.dataValues.reported_user.map(
      (ele) => ele.swiped_to
    );

    const communicated_user =
      neglect_profiles_updated.dataValues.communicated_user.map(
        (ele) => ele.swiped_to
      );

    const allProfilesToNeglect = [
      ...rejected_profile,
      ...connected_users,
      ...pending_users_request_sent,
      ...blocked_user,
      ...reported_user,
      ...communicated_user,
    ];

    console.log("profiles to be neglected", allProfilesToNeglect);

    const whereClause = {
      user_id: {
        [Op.and]: [{ [Op.notIn]: allProfilesToNeglect }, { [Op.ne]: user_id }],
      },
    };

    const includeClause = [
      {
        model: UsersInterests,
        attributes: [
          "latitude",
          "longitude",
          "city",
          "country",
          "skills",
          "interest",
        ],
      },
    ];

    if (skills.length > 0 || interest.length > 0) {
      includeClause[0].where = {
        [Op.or]: [
          {
            skills: {
              [Op.overlap]: skills,
            },
          },
          {
            interest: {
              [Op.overlap]: interest,
            },
          },
        ],
      };
    }

    const profiles = await UserDetails.findAll({
      where: whereClause,
      include: includeClause,
      limit: 50,
    });

    return res.status(200).json({
      message: "Relevant Profiles updated and fetched successfully",
      status: 200,
      data: profiles,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching profiles" });
  }
};

module.exports = { getRelevantProfiles };
