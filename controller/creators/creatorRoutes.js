const {Router} = require('express')
const router=Router();
const creatorController=require('./creatorController');

router.post("/sendConnectRequest",creatorController.sendConnectRequest);
module.exports=router;