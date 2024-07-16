const {Router}= require('express')
const router=Router();
const chats=require('./chatsController');

router.post('/sendMessage',chats.sendMessage)
router.post('/getAllMessages',chats.getAllMessages)
router.post('/deleteChat',chats.deleteChat)
module.exports=router;
