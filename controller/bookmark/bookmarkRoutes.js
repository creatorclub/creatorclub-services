const { Router } = require("express");
const {
    bookmarkCollab
} = require("./bookmarkController");

const router = Router();

router.post("/bookmarkCollab",bookmarkCollab);

module.exports=router;