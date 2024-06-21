const { Router } = require("express");

const router = Router();

const collabSwipeReq = require("./collabSwipeRequestsController");


router.post("/sendCollabRequest",collabSwipeReq.sendRequest);

router.put('/updateCollabAction',collabSwipeReq.updateAction);

module.exports = router;
