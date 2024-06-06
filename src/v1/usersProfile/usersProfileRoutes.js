const { Router } = require("express");

const router = Router();

const usersProfile = require("./usersProfileController");

router.get("/allProfiles", usersProfile.getAllUsersProfile);

router.get("/getUserById/:user_id",usersProfile.getProfileById);

router.put("/updateProfile/:user_id", usersProfile.updateUsersProfile);

router.delete("/deleteProfile/:user_id", usersProfile.deleteUserProfile);

router.put("/storeCollabs/:user_id",usersProfile.storeUserCollabs);

router.put("/createProfile",usersProfile.createProfile);

module.exports = router;
