const { Router } = require("express");

const router = Router();

const creatorsSwipeReq = require("./creatorsSwipeRequestsController");

router.get("/getProfiles/:user_id",creatorsSwipeReq.getAcceptedProfiles);

router.post("/connectCreator",creatorsSwipeReq.sendRequest);

router.put("/updateCreatorsAction",creatorsSwipeReq.updateAction);


module.exports=router