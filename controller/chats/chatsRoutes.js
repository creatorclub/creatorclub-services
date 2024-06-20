const {Router}= require('express')
const router=Router();
const chats=require('./chatsController');

router.post('/sendMessage',chats.sendMessage)
module.exports=router;

