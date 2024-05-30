const {Router}= require('express')
const router=Router();
const controller= require('./authController')

router.post("/",controller.registerUser);


module.exports=router;