const {Router}= require('express')
const router=Router();

const logs=require('./logsController');

router.post("/sendLogs",logs.SendLogs);
router.get("/getLogs",logs.GetLogs);
module.exports=router;