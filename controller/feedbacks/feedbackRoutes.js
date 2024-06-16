const {Router}= require('express')
const router=Router();
const feedback=require('./feedbackController');

router.post("/sendFeedback",feedback.sendRequest);

router.get("/allFeedbacks",feedback.getAllFeedBack);

router.get("/allFeatureRequests",feedback.getAllFeatureRequests);

module.exports=router;