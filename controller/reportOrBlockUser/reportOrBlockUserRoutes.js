const { Router } = require("express");
const {
    blockUser
} = require("./reportOrBlockUserController");


const router = Router();

router.post("/blockOrReportUser",blockUser);

module.exports=router;