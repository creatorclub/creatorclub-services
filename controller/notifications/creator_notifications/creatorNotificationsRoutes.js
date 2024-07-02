const { Router } = require("express");

const router = Router();

const creatorsNotification=require('./creatorNotificationsController');


router.get("/getAllCreatorsNotification/:user_id",creatorsNotification.getAllInboxRequests);

module.exports=router;