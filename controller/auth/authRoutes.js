const {Router}= require('express')
const router=Router();
const controller= require('./authController')

router.post("/",controller.AuthenticateUser);


module.exports=router;