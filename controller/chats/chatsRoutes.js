const {Router}= require('express')
const router=Router();
const chats=require('./chatsController');

router.post('/sendMessage',chats.sendMessage)
router.post('/getAllMessages',chats.getAllMessages)
module.exports=router;

