const {Router}= require('express')
const router=Router();
const collabs=require('./collabController');

router.get("/allCollabs",collabs.getAllCollabs);

router.put("/updateCollab/:collab_id",collabs.updateCollab);

router.delete("/deleteCollab/:collab_id",collabs.deleteCollab);

router.post("/createCollab",collabs.createCollab);

router.get('/getMyCollabs/:user_id',collabs.getMyCollabs);



module.exports=router;
