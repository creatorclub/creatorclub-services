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
  const { records } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
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

      const blocked_user=neglect_profiles.dataValues.blocked_user.map(ele=>ele.swiped_to);

      const reported_user=neglect_profiles.dataValues.reported_user.map(ele=>ele.swiped_to);

      const communicated_user=neglect_profiles.dataValues.communicated_user.map((ele)=>ele.swiped_to);

      const allProfilesToNeglect = [
        ...rejected_profile,
        ...connected_users,
        ...pending_users_request_sent,
        ...blocked_user,
        ...reported_user,
        ...communicated_user
      ];

      console.log("profiles to be neglected", allProfilesToNeglect);

      const profiles = await UserDetails.findAll({
        where: {
          user_id: {
            [Op.and]: [
              { [Op.notIn]: allProfilesToNeglect },
              { [Op.ne]: user_id },
            ],
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
        limit: 50,
      });

      return res.status(200).json({
        message: "Relevant Profiles fetched succesfully",
        status: 200,
        data: profiles,
      });
    } else {
      for (const { user_id, swiped_to, action, timestamp } of records) {
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

      const blocked_user=neglect_profiles.dataValues.blocked_user.map(ele=>ele.swiped_to);

      const reported_user=neglect_profiles.dataValues.reported_user.map(ele=>ele.swiped_to);

      const communicated_user=neglect_profiles.dataValues.communicated_user.map((ele)=>ele.swiped_to);

      const allProfilesToNeglect = [
        ...rejected_profile,
        ...connected_users,
        ...pending_users_request_sent,
        ...blocked_user,
        ...reported_user,
        ...communicated_user
      ];

    console.log("profiles to be neglected", allProfilesToNeglect);

    const profiles = await UserDetails.findAll({
      where: {
        user_id: {
          [Op.and]: [
            { [Op.notIn]: allProfilesToNeglect },
            { [Op.ne]: user_id },
          ],
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
      limit: 50,
    });
    return res.status(200).json({
      message: "Relevant Profiles updated and fetched succesfully",
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

const filterCreators = async (req, res) => {
  const user_id = req.params.user_id;
  const { skills, interests } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    var neglect_profiles = await ConnectedCreators.findOne({
      where: { user_id: user_id },
    });

    if (!neglect_profiles) {
      const matchingUserInterests = await UserDetails.findAll({

        include:[
          
         { where: {
            [Op.or]: [
              {
                skills: {
                  [Op.overlap]: skills,
                },
              },
              {
                interest: {
                  [Op.overlap]: interests,
                },
              },
            ],
          },}
        ]
        
        
      });
  
      const matchingUserIds = matchingUserInterests.map(ui => ui.user_id);
  
      const matchingUserDetails = await UserDetails.findAll({
        where: {
          user_id: matchingUserIds,
        },
      });

      // const users = await UserDetails.findAll({
      //   where: {
      //     user_id: {
      //       [Op.ne]: user_id,
      //     },
      //     [Op.or]: [
      //       {
      //         skills: {
      //           [Op.overlap]: skills,
      //         },
      //       },
      //       {
      //         interest: {
      //           [Op.overlap]: interests,
      //         },
      //       },
      //     ],
      //   },
      //   limit:50,
      //   include: [
      //     {
      //       model: UsersInterests,
      //       attributes: [
      //         "latitude",
      //         "longitude",
      //         "city",
      //         "country",
      //         "skills",
      //         "interest",
      //       ],
      //     },
      //   ],
      // });


      return res.status(200).json({
        message: "Filtered profiles fetched",
        status: 200,
        data: matchingUserDetails,
      });
    }else{
      const rejected_profile = neglect_profiles.dataValues.rejected_users.map(
        (elem) => elem.swiped_to
      );

      const connected_users = neglect_profiles.dataValues.connected_users.map(
        (elem) => elem.swiped_to
      );

      const pending_users_request_sent = neglect_profiles.dataValues.outbox.map(
        (elem) => elem.swiped_to
      );

      const allProfilesToNeglect = [
        ...rejected_profile,
        ...connected_users,
        ...pending_users_request_sent,
      ];

      console.log("profiles to be neglected", allProfilesToNeglect);

      const profiles = await UserDetails.findAll({
        where: {
          user_id: {
            [Op.and]: [
              { [Op.notIn]: allProfilesToNeglect },
              { [Op.ne]: user_id },
            ],
          },
          [Op.or]: [
            {
              skills: {
                [Op.overlap]: skills,
              },
            },
            {
              interest: {
                [Op.overlap]: interests,
              },
            },
          ],
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
        limit: 50,
      });

      return res.status(200).json({
        message: "Relevant Profiles fetched succesfully",
        status: 200,
        data: profiles,
      });
    }
    
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching matching users" });
  }
};
module.exports = { getRelevantProfiles, filterCreators };
