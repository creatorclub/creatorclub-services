const { Router } = require("express");

const router = Router();

const acceptedRequest = require("./acceptedRequestController");


router.post("/sendRequest",acceptedRequest.sendRequest);

router.put('/updateStatus',acceptedRequest.updateStatus);

module.exports = router;
