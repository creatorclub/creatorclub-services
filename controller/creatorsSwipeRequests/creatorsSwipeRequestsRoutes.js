const { Router } = require("express");
const {
    getAcceptedProfiles,
    sendRequest,
    updateAction,
    getAllConnectedUsers
} = require("./creatorsSwipeRequestsController");

const router = Router();

router.get("/getAllProfile/:user_id", getAcceptedProfiles);
router.post("/sendCreatorRequests", sendRequest);
router.put("/updateCreatorRequest", updateAction);
router.get("/getAllConnectedUsers/:user_id",getAllConnectedUsers)


module.exports = router;
