const { Router } = require("express");

const router = Router();

const creatorsSwipeReq = require("./creatorsSwipeRequestsController");

router.post("/connectCreator",creatorsSwipeReq.sendRequest);

router.put("/updateCreatorsAction",creatorsSwipeReq.updateAction);


module.exports=router