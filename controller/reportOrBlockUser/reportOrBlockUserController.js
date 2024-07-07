const ConnectedCreators = require("../../models/creator model/creatorsSwipeRequests/connectedCreatorsModel");

const blockUser = async (req, res) => {
  let { user_id, user_id_to_block, timestamp, action } = req.body;

  action=action.toLowerCase();
  try {
    const findUser = await ConnectedCreators.findOne({
      where: { user_id: user_id },
    });

    if (!findUser) {
      return res
        .status(400)
        .json({ message: "user_id not found", status: 400, data: [] });
    }

    const check_connected_users = findUser.dataValues.connected_users.filter(
      (ele) => ele.swiped_to !== user_id_to_block
    );

    const check_rejected_users = findUser.dataValues.rejected_users.filter(
      (ele) => ele.swiped_to !== user_id_to_block
    );

    const check_outbox_users = findUser.dataValues.outbox.filter(
      (ele) => ele.swiped_to !== user_id_to_block
    );

    if (action === "block") {
      let updatedBlockArr = findUser.dataValues.blocked_user;
      
      updatedBlockArr.push({
        swiped_to: user_id_to_block,
        timestamp,
      });

      await ConnectedCreators.update(
        {
          connected_users: check_connected_users,
          rejected_users: check_rejected_users,
          outbox: check_outbox_users,
          blocked_user: updatedBlockArr,
        },
        { where: { user_id: user_id } }
      );

      return res
        .status(200)
        .json({ message: "User blocked successfully", status: 200 });
    } else if (action === "report") {
      let updatedReportedArr = findUser.dataValues.reported_user;

      updatedReportedArr.push({
        swiped_to: user_id_to_block,
        timestamp,
      });

      await ConnectedCreators.update(
        {
          connected_users: check_connected_users,
          rejected_users: check_rejected_users,
          outbox: check_outbox_users,
          reported_user: updatedReportedArr,
        },
        { where: { user_id: user_id } }
      );

      return res
        .status(200)
        .json({ message: "User reported successfully", status: 200 });
    } else {
      return res
        .status(400)
        .json({ message: "No such action exists", status: 400 });
    }
  } catch (err) {
    return res.status(500).json({ message: `Error ${err}`, status: 500 });
  }
};

module.exports = { blockUser };
