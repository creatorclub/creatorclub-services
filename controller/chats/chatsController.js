const Message = require("../../models/messagesModel");
const Chats = require("../../models/chatsModel");
const UsersPersonalDetails = require("../../models/usersPersonalDetailsModel.js");
const UsersDetails = require("../../models/usersDetailsModel.js");
const { sendPushNotification } = require("../../services/fcmServices.js");
const { Op } = require("sequelize");

const sendMessage = async (req, res) => {
  const {
    chat_id,
    sender_id,
    receiver_id,
    last_content_type,
    content,
    message_id,
    is_collab_chat,
  } = req.body;

  try {
    const senderDetails = await UsersDetails.findOne({
      where: { user_id: sender_id },
      attributes: ["name", "imageURL"],
    });

    if (!senderDetails) {
      return res.status(404).json({ error: "Sender not found" });
    }

    const sender_name = senderDetails.name;
    const display_picture = senderDetails.imageURL;

    const existingMessage = await Message.findByPk(message_id);
    if (existingMessage) {
      return res.status(400).json({ error: "Duplicate message_id" });
    }

    const chatExists = await checkIfChatIdExists(
      chat_id,
      sender_id,
      receiver_id,
      last_content_type,
      content,
      message_id,
      is_collab_chat,
      sender_name,
      display_picture
    );

    res
      .status(201)
      .json({ message: "Chat processed", status: 201, data: chatExists });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const checkIfChatIdExists = async (
  chat_id,
  sender_id,
  receiver_id,
  last_content_type,
  content,
  message_id,
  is_collab_chat,
  sender_name,
  display_picture
) => {
  try {
    const chat = await Chats.findByPk(chat_id);

    if (!chat) {
      return await createNewChat(
        chat_id,
        sender_id,
        receiver_id,
        last_content_type,
        content,
        message_id,
        is_collab_chat,
        sender_name,
        display_picture
      );
    } else {
      return await updateExistingChat(
        chat_id,
        sender_id,
        receiver_id,
        last_content_type,
        content,
        message_id,
        is_collab_chat,
        sender_name,
        display_picture
      );
    }
  } catch (error) {
    console.error("Error in checkIfChatIdExists:", error);
    throw error;
  }
};

const updateExistingChat = async (
  chat_id,
  sender_id,
  receiver_id,
  last_content_type,
  content,
  message_id,
  is_collab_chat,
  sender_name,
  display_picture
) => {
  try {
    const updateData = {
      last_content_type,
      content,
    };

    await Chats.update(updateData, { where: { chat_id } });
    return await updateMessageTable(
      chat_id,
      sender_id,
      receiver_id,
      last_content_type,
      content,
      message_id,
      is_collab_chat,
      sender_name,
      display_picture
    );
  } catch (error) {
    console.error("Error in updateExistingChat:", error);
    throw error;
  }
};

const createNewChat = async (
  chat_id,
  sender_id,
  receiver_id,
  last_content_type,
  content,
  message_id,
  is_collab_chat,
  sender_name,
  display_picture
) => {
  try {
    const newChat = await Chats.create({
      chat_id,
      sender_id,
      receiver_id,
      last_content_type,
      content,
      is_collab_chat,
    });

    return await updateMessageTable(
      chat_id,
      sender_id,
      receiver_id,
      last_content_type,
      content,
      message_id,
      is_collab_chat,
      sender_name,
      display_picture
    );
  } catch (error) {
    console.error("Error in createNewChat:", error);
    throw error;
  }
};

const updateMessageTable = async (
  chat_id,
  sender_id,
  receiver_id,
  last_content_type,
  content,
  message_id,
  is_collab_chat,
  sender_name,
  display_picture
) => {
  try {
    const message = await Message.create({
      message_id,
      chat_id,
      sender_id,
      receiver_id,
      content,
      content_type: last_content_type,
    });

    await sendNotificationToReceiver(
      chat_id,
      message_id,
      receiver_id,
      sender_id,
      sender_name,
      display_picture,
      last_content_type,
      content,
      is_collab_chat,
      new Date()
    );

    return message;
  } catch (error) {
    console.error("Error in updateMessageTable:", error);
    throw error;
  }
};

const sendNotificationToReceiver = async (
  chat_id,
  message_id,
  receiver_id,
  sender_id,
  sender_name,
  display_picture,
  content_type,
  content,
  is_collab_chat,
  timestamp
) => {
  try {
    const userDetails = await UsersPersonalDetails.findOne({
      where: { user_id: receiver_id },
      attributes: ["device_token"],
    });

    if (!userDetails || !userDetails.device_token) {
      console.log(`No device tokens found for user_id: ${receiver_id}`);
      return;
    }

    const deviceTokens = userDetails.device_token;
    const notificationTitle = sender_name;
    const notificationBody = content;

    const additionalData = {
      chat_id: String(chat_id),
      message_id: String(message_id),
      sender_id: String(sender_id),
      receiver_id: String(receiver_id),
      content_type: String(content_type),
      content: String(content),
      is_collab_chat: String(is_collab_chat),
      display_picture: String(display_picture),
      sender_name: String(sender_name),
      timestamp: String(timestamp),
    };

    for (const token of deviceTokens) {
      await sendPushNotification(
        token,
        notificationTitle,
        notificationBody,
        additionalData
      );
    }

    console.log(
      `Notifications sent to all devices for user_id: ${receiver_id}`
    );
  } catch (error) {
    console.error(`Error sending notification: ${error.message}`);
  }
};

module.exports = {
  sendMessage,
};
