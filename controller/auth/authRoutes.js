const {Router}= require('express')
const router=Router();
const controller= require('./authController')

router.post("/",controller.AuthenticateUser);

router.put('/initialiseApp/:user_id',controller.updateDeviceToken);

module.exports=router;