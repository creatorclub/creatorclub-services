const { Router } = require("express");
const {
    sendRequest,
    updateAction,
} = require("./creatorsSwipeRequestsController");

const {getAllConnectedUsers}=require('./getAllConnectedUsers');

const getRelevantProfiles=require('./getRelevantProfiles');

const router = Router();

router.post("/getAllProfile/:user_id", getRelevantProfiles.getRelevantProfiles);
router.post("/sendCreatorRequests", sendRequest);
router.put("/updateCreatorRequest", updateAction);
router.get("/getAllConnectedUsers/:user_id",getAllConnectedUsers)
router.post("/filterCreators/:user_id",getRelevantProfiles.filterCreators)

module.exports = router;
