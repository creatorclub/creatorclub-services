const { Router } = require("express");

const router = Router();

const collabNotification=require('./getAllNotificationsController');


router.get("/getAllNotification/:user_id",collabNotification.getAllInboxRequests);

module.exports=router;