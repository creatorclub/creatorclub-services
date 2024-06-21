const {Router}= require('express')
const router=Router();
const chats=require('./chatsController');

router.post('/message',chats.sendMessage)

router.get("/:userId/getAllUserMessages",chats.getAllMessagesOfUser);

module.exports=router;

