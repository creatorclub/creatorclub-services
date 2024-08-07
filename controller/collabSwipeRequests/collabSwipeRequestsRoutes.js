const { Router } = require("express");

const router = Router();

const collabSwipeReq = require("./collabSwipeRequestsController");

const getRelevantCollabs=require('./getRelevantCollabs');

router.post("/getAllCollabs/:user_id", getRelevantCollabs.getRelevantCollabs);
router.post("/sendCollabRequests", collabSwipeReq.sendCollabRequest);
router.put("/updateCollabRequest", collabSwipeReq.updateAction);

module.exports = router;
