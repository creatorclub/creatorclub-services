const { Router } = require("express");

const router = Router();

const collabSwipeReq = require("./collabSwipeRequestsController");


router.post("/sendRequest",collabSwipeReq.sendRequest);

router.put('/updateStatus',collabSwipeReq.updateStatus);

module.exports = router;
