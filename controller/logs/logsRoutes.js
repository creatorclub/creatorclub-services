const {Router}= require('express')
const router=Router();

const logs=require('./logsController');

router.post("/sendLogs",logs.SendLogs);

module.exports=router;