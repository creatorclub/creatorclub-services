const Message = require("../../models/chats/messagesModel.js");
const Chats = require("../../models/chats/chatsModel.js");
const UsersPersonalDetails = require("../../models/usersInfo/usersPersonalDetailsModel.js");
const UsersDetails = require("../../models/usersInfo/usersDetailsModel.js");
const { sendPushNotification } = require("../../services/fcmServices.js");
const { Op } = require("sequelize");
const ConnectedCreators = require("../../models/creator model/creatorsSwipeRequests/connectedCreatorsModel.js");

const sendMessage = async (req, res) => {
  const {
    chat_id,
    message_id,
    sender_id,
    receiver_id,
    content_type,
    content,
    timestamp,
    is_collab_chat,
  } = req.body;

  try {
    const senderDetails = await UsersDetails.findOne({
      where: { user_id: sender_id },
      attributes: ["name", "userImageUrl"],
    });

    if (!senderDetails) {
      return res.status(404).json({ error: "Sender not found" });
    }

    const sender_name = senderDetails.name;
    const display_picture = senderDetails.userImageUrl;

    const existingMessage = await Message.findByPk(message_id);
    if (existingMessage) {
      return res.status(400).json({ error: "Duplicate message_id" });
    }

    const chatExists = await checkIfChatIdExists(
      chat_id,
      sender_id,
      receiver_id,
      content_type,
      content,
      message_id,
      is_collab_chat,
      sender_name,
      display_picture,
      timestamp
    );

    res.status(201).json({
      message: "Chat processed",
      status: 201,
      data: chatExists,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const checkIfChatIdExists = async (
  chat_id,
  sender_id,
  receiver_id,
  content_type,
  content,
  message_id,
  is_collab_chat,
  sender_name,
  display_picture,
  timestamp
) => {
  try {
    const chat = await Chats.findByPk(chat_id);

    if (!chat) {
      return await createNewChat(
        chat_id,
        sender_id,
        receiver_id,
        content_type,
        content,
        message_id,
        is_collab_chat,
        sender_name,
        display_picture,
        timestamp
      );
    } else {
      return await updateExistingChat(
        chat_id,
        sender_id,
        receiver_id,
        content_type,
        content,
        message_id,
        is_collab_chat,
        sender_name,
        display_picture,
        timestamp
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
  content_type,
  content,
  message_id,
  is_collab_chat,
  sender_name,
  display_picture,
  timestamp
) => {
  try {
    const updateData = {
      last_content : content,
      last_content_type: content_type,
      last_content_timestamp:timestamp,
    };

    await Chats.update(updateData, { where: { chat_id } });
    return await updateMessageTable(
      chat_id,
      sender_id,
      receiver_id,
      content_type,
      content,
      message_id,
      is_collab_chat,
      sender_name,
      display_picture,
      timestamp
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
  content_type,
  content,
  message_id,
  is_collab_chat,
  sender_name,
  display_picture,
  timestamp
) => {
  try {
    const newChat = await Chats.create({
      chat_id,
      sender_id,
      receiver_id,
      last_content_type: content_type,
      content,
      is_collab_chat,
    });

    return await updateMessageTable(
      chat_id,
      sender_id,
      receiver_id,
      content_type,
      content,
      message_id,
      is_collab_chat,
      sender_name,
      display_picture,
      timestamp
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
  content_type,
  content,
  message_id,
  is_collab_chat,
  sender_name,
  display_picture,
  timestamp
) => {
  try {
    const message = await Message.create({
      message_id,
      chat_id,
      sender_id,
      receiver_id,
      content,
      content_type,
      is_read: false,
      timestamp,
    });

    await updateUserSwipeRequests(sender_id, receiver_id, timestamp);

    await sendNotificationToReceiver(
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
    );

    return message;
  } catch (error) {
    console.error("Error in updateMessageTable:", error);
    throw error;
  }
};

const updateUserSwipeRequests = async (sender_id, receiver_id, timestamp) => {
  try {
    const userOne = await ConnectedCreators.findOne({
      where: { user_id: sender_id },
    });

    const userTwo = await ConnectedCreators.findOne({
      where: { user_id: receiver_id },
    });

    if (!userOne) {
      console.log("userOne is not present in creators swipe Table");
      return;
    }
    if (!userTwo) {
      console.log("userTwo is not present in creators swipe Table");
      return;
    }

    const userOneConnectedArray = userOne.dataValues.connected_users;

    const userTwoConnectedArray = userTwo.dataValues.connected_users;

    const userOneObject = userOneConnectedArray.filter(
      (ele) => ele.swiped_to !== receiver_id
    );

    const userTwoObject = userTwoConnectedArray.filter(
      (ele) => ele.swiped_to !== sender_id
    );
    const userOneCommunicatedArray = userOne.dataValues.communicated_user;
    const userTwoCommunicatedArray = userTwo.dataValues.communicated_user;

    const userOneObjectExists = userOneCommunicatedArray.find(
      (ele) => ele.swiped_to === receiver_id 
    );

    const userTwoObjectExists = userTwoCommunicatedArray.find(
      (ele) => ele.swiped_to === sender_id 
    );

    if (!userOneObjectExists && !userTwoObjectExists) {
      userOne.dataValues.communicated_user.push({
        swiped_to: receiver_id,
        timestamp: timestamp,
      });

      userTwo.dataValues.communicated_user.push({
        swiped_to: sender_id,
        timestamp: timestamp,
      });
    }

    await ConnectedCreators.update(
      {
        connected_users: userOneObject,
        communicated_user: userOne.dataValues.communicated_user,
      },
      { where: { user_id: sender_id } }
    );

    await ConnectedCreators.update(
      {
        connected_users: userTwoObject,
        communicated_user: userTwo.dataValues.communicated_user,
      },
      { where: { user_id: receiver_id } }
    );

    console.log("Communicated user updated");
  } catch (err) {
    console.log("error occured while updated communicated user");
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

const getAllMessages = async (req, res) => {
  console.log("hellooo I am in getAllMessages");

  const { user_id } = req.body;
  console.log("Received user_id:", user_id);

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const chats = await fetchChats(user_id);
    console.log("Found chats:", chats);

    const chatIds = extractChatIds(chats);
    console.log("Chat IDs:", chatIds);

    const messages = await fetchMessages(chatIds);
    console.log("Found messages:", messages);

    const otherUserIds = extractOtherUserIds(chats, user_id);
    console.log("Other User IDs:", otherUserIds);

    const otherUsers = await fetchOtherUsers(otherUserIds);
    console.log("Found other users:", otherUsers);

    const otherUserDetails = mapUserDetails(otherUsers);
    console.log("Other user details:", otherUserDetails);

    const groupedMessages = groupMessages(
      chats,
      messages,
      otherUserDetails,
      user_id
    );
    console.log("Grouped messages:", groupedMessages);

    res.json({
      message: "Successfully fetched all the messages",
      status: 200,
      data: groupedMessages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchChats = async (user_id) => {
  return await Chats.findAll({
    where: {
      [Op.or]: [{ sender_id: user_id }, { receiver_id: user_id }],
    },
  });
};

const extractChatIds = (chats) => {
  return chats.map((chat) => chat.chat_id);
};

const fetchMessages = async (chatIds) => {
  return await Message.findAll({
    where: {
      chat_id: {
        [Op.in]: chatIds,
      },
    },
    order: [["timestamp", "ASC"]],
  });
};

const extractOtherUserIds = (chats, user_id) => {
  return chats.map((chat) =>
    chat.sender_id === user_id ? chat.receiver_id : chat.sender_id
  );
};

const fetchOtherUsers = async (otherUserIds) => {
  return await UsersDetails.findAll({
    where: {
      user_id: {
        [Op.in]: otherUserIds,
      },
    },
  });
};

const mapUserDetails = (otherUsers) => {
  return otherUsers.reduce((acc, user) => {
    acc[user.user_id] = user;
    return acc;
  }, {});
};


const groupMessages = (chats, messages, otherUserDetails, user_id) => {
  const groupedMessages = chats.map((chat) => {
    // Determine the other user in the chat
    const receiver_id = chat.sender_id === user_id ? chat.receiver_id : chat.sender_id;

    // Filter messages for the current chat and sort by timestamp descending
    const chatMessages = messages
      .filter((msg) => msg.chat_id === chat.chat_id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get other user details
    const otherUser = otherUserDetails[receiver_id] || {};

    return {
      chat_id: chat.chat_id,
      last_content_type: chat.last_content_type,
      last_content: chatMessages.length > 0 ? chatMessages[0].content : null,
      last_content_timestamp: chat.last_content_timestamp,
      is_read: chatMessages.length > 0 ? chatMessages[0].is_read : null,
      participant_display_picture: otherUser.userImageUrl || "",
      participant_name: otherUser.name || "",
      receiver_id: receiver_id,
      is_collab_chat:chat.is_collab_chat,
      chats: chatMessages.map((msg) => ({
        message_id: msg.message_id,
        chat_id: msg.chat_id,
        content: msg.content,
        content_type: msg.content_type,
        timestamp: msg.timestamp,
        is_read: msg.is_read,
        receiver_id: msg.receiver_id,
        sender_id: msg.sender_id
      }))
    };
  });

  // Sort the groupedMessages array by the latest message timestamp in descending order
  const sortedGroupedMessages = groupedMessages.sort((a, b) => new Date(b.last_content_timestamp) - new Date(a.last_content_timestamp));

  // Log the sorted grouped messages for debugging
  console.log("Sorted grouped messages with receiver_id:", sortedGroupedMessages);

  return sortedGroupedMessages;
};

module.exports = {
  sendMessage,
  getAllMessages,
};
