const { Router } = require("express");

const router = Router();

const collabNotification=require('./getAllNotificationsController');


router.get("/getAllNotification/:user_id",collabNotification.getAllInboxRequests);
router.post("/clearAllNotification/",collabNotification.clearAllNotification);


module.exports=router;