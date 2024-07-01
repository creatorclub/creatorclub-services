const ConnectedCreators = require("../../models/creator model/creatorsSwipeRequests/connectedCreatorsModel");

const getAllConnectedUsers=async(req,res)=>{
    const user_id=req.params.user_id;
  
    if(!user_id){
      return res.status(400).json({message:"Enter a valid user_id",status:400})
    }
  
    try{
      const result = await ConnectedCreators.findOne({
        where: { user_id: user_id },
        attributes: ['connected_users']
      });
  
      if (!result) {
        return res.status(404).json({ message: "No connected users found", status: 404 });
      }
  
      const connectedUsers = result.dataValues.connected_users;
  
      return res.status(200).json({
        message: "Connected users fetched",
        status: 200,
        data: connectedUsers
      });
    }
    catch (error) {
      console.error("Error sending request:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while sending request" });
    }
  }

  module.exports={getAllConnectedUsers};