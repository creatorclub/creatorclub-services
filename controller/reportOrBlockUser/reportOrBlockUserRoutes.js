const { Router } = require("express");
const {
    blockUser,
    reportCollab
} = require("./reportOrBlockUserController");


const router = Router();

router.post("/blockOrReportUser",blockUser);

router.post("/blockCollab",reportCollab);

module.exports=router;