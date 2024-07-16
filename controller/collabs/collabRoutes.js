const {Router}= require('express')
const router=Router();
const collabs=require('./collabController');

router.get("/allCollabs/:user_id",collabs.getAllCollabs);

router.put("/updateCollab/:collab_id",collabs.updateCollab);

router.delete("/deleteCollab/:collab_id",collabs.deleteCollab);

router.post("/createCollab",collabs.createCollab);

router.get('/getMyCollabs/:user_id',collabs.getMyCollabs);

router.post("/getCollabById/:collab_id",collabs.getCollabById);


module.exports=router;
