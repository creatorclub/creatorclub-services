const { Op } = require("sequelize");
const creatorConnectRequests = require("../../models/creatorsModel/creatorConnectRequestModel");
const UserPersonalDetail = require("../../models/usersInfo/usersPersonalDetailsModel");
const CreatorConnectionRequests = require("../../models/creatorsModel/creatorConnectionRequestsModel");

const sendConnectRequest = async (req, res) => {
    const { user_id, requested_to_id, timestamp } = req.body;
    console.log('data in request body', user_id, requested_to_id, timestamp);

    if (!user_id) {
        return res.status(400).json({
            message: "User ID is required",
            status: 400,
        });
    }

    if (!requested_to_id) {
        return res.status(400).json({
            message: "Requested User ID is required",
            status: 400,
        });
    }

    try {
        const existingUser = await UserPersonalDetail.findOne({
            where: { user_id },
        });

        const existingRequestedUser = await UserPersonalDetail.findOne({
            where: { user_id: requested_to_id },
        });

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found",
                status: 404,
            });
        }

        if (!existingRequestedUser) {
            return res.status(404).json({
                message: "Requested User not found",
                status: 404,
            });
        }

        const connectRequestData = {
            user_id,
            requested_to_id,
            timestamp,
        };

        const [userConnection, createdUser] = await CreatorConnectionRequests.findOrCreate({
            where: { user_id },
            defaults: { outbox: [connectRequestData] }
        });

        if (!createdUser) {
            // If the row already exists, update the outbox
            userConnection.outbox = [...userConnection.outbox, connectRequestData];
            await userConnection.save();
        }

        const [requestedUserConnection, createdRequestedUser] = await CreatorConnectionRequests.findOrCreate({
            where: { user_id: requested_to_id },
            defaults: { inbox: [connectRequestData] }
        });

        if (!createdRequestedUser) {
            // If the row already exists, update the inbox
            requestedUserConnection.inbox = [...requestedUserConnection.inbox, connectRequestData];
            await requestedUserConnection.save();
        }

        res.status(200).json({
            message: "Connection request sent successfully",
            status: 200,
        });

    } catch (error) {
        console.log('error', error);
        return res.status(500).json({
            message: "Internal Server Error",
            status: 500,
        });
    }
};

module.exports = { sendConnectRequest };
