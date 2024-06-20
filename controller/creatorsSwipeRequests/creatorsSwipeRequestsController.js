const CreatorsRequest = require('../../models/creatorsSwipeModel');

const sendRequest = async (req, res) => {
    const { swiped_by, swiped_to } = req.body;
  
    try {
      const result = await CreatorsRequest.create({
        swiped_by, swiped_to
      });
  
      res.status(200).json({
        message: "Collaboration request details stored successfully",
        status: 200,
        data: { request_id: result.profile_req_id },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "An error occurred while storing the collaboration request details",
        status: 500,
        data: {},
      });
    }
  };

  const updateAction = async (req, res) => {
    const { profile_req_id, action } = req.body;
  
    try {
      const result = await CreatorsRequest.update({ action }, { where: { profile_req_id } });
  
      if (result[0] === 0) {
        return res.status(404).json({
          message: "Request ID not found",
          status: 404,
        });
      }
  
      res.status(200).json({
        message: `Request swiped to ${action}`,
        status: 200,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "An error occurred while updating the status",
        status: 500,
      });
    }
  };
  


  module.exports={sendRequest,updateAction}