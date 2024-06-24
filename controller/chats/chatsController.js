const Message = require("../../models/chats/messagesModel");
const Chats = require("../../models/chats/chatsModel");
const { Op } = require('sequelize');

const sendMessage = async (req, res) => {
  const {
    chat_id,
    sender_id,
    receiver_id,
    last_content_type,
    content,
    message_id,
  } = req.body;
  const myres = await Chats.findByPk(chat_id);
  console.log("first", myres);
  if (!myres) {
    const newChat = await Chats.create({
      chat_id,
      sender_id,
      receiver_id,
      last_content_type,
      content,
    });

    const message = await Message.create({
      message_id,
      chat_id,
      sender_id,
      receiver_id,
      content,
      content_type: last_content_type,
    });

    return res
      .status(201)
      .json({ message: "Chat created", status: 201, data: message });
  } else {
    const updateData = {
      chat_id,
      last_content_type,
      content,
    };

    await Chats.update(updateData, { where: { chat_id } });

    await Message.create({
      message_id,
      chat_id,
      sender_id,
      receiver_id,
      content,
      content_type: last_content_type,
    });
    res
      .status(200)
      .json({ message: "Latest chat inserted", status: 200, data: {} });
  }
};

const getAllMessagesOfUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      order: [['timestamp', 'DESC']]
    });

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found" });
    }

    const groupedMessages = messages.reduce((acc, message) => {
      if (!acc[message.chat_id]) {
        acc[message.chat_id] = [];
      }
      acc[message.chat_id].push(message);
      return acc;
    }, {});

    console.log("grouped Message",groupedMessages)

    const response = Object.keys(groupedMessages).map((chatId) => ({
      chat_id: chatId,
      messages: groupedMessages[chatId],
    }));

    response.sort((a, b) => {
      const aLatestTimestamp = new Date(a.messages[0].timestamp).getTime();
      const bLatestTimestamp = new Date(b.messages[0].timestamp).getTime();
      return bLatestTimestamp - aLatestTimestamp;
    });

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  sendMessage,
  getAllMessagesOfUser,
};
