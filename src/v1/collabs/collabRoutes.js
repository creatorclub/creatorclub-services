const {Router}= require('express')
const router=Router();
const collabs=require('./collabController');

router.get("/",collabs.getAllCollabs);

router.put("/updateCollab/:collab_id",collabs.updateCollab);

router.delete("/deleteCollab/:collab_id",collabs.deleteCollab);

router.post("/createCollab",collabs.createCollab);

module.exports=router;
