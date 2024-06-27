const { Router } = require("express");

const router = Router();

const collabSwipeReq = require("./collabSwipeRequestsController");

router.get("/getAllCollabs/:user_id", collabSwipeReq.getRelevantCollabs);
router.post("/sendCollabRequests", collabSwipeReq.sendRequest);
router.put("/updateCollabRequest", collabSwipeReq.updateAction);

module.exports = router;
