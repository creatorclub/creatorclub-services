const { Router } = require("express");

const router = Router();

const usersProfile = require("./usersProfileController");

router.get("/allCreatorProfiles", usersProfile.getAllUsersProfile);

router.get("/getUserById/:user_id",usersProfile.getProfileById);

// router.delete("/deleteProfile/:user_id", usersProfile.deleteUserProfile);

router.put("/updateProfile/:user_id",usersProfile.upsertUserProfile);


module.exports = router;
