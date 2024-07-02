const { Router } = require("express");

const router = Router();

const collabNotification=require('./collabNotificationsController');


router.get("/getAllCollabNotification/:user_id",collabNotification.getAllInboxRequests);

module.exports=router;