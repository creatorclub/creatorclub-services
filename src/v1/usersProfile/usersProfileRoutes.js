const { Router } = require("express");

const router = Router();

const usersProfile = require("./usersProfileController");

router.get("/", usersProfile.getAllUsersProfile);

router.put("/updateProfile/:user_id", usersProfile.updateUsersProfile);

router.delete("/deleteProfile/:user_id", usersProfile.deleteUserProfile);

router.put("/createProfile",usersProfile.createProfile);

module.exports = router;
