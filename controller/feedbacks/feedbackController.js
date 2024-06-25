const FeaturesModel = require("../../models/featureRequests/featureRequestModel");
const FeedbackModel = require("../../models/feedbacks/feedbackModel");

const sendRequest = async (req, res) => {
  const { user_id, timestamp, feature_request, feedback } = req.body;
  try {
    if (!feature_request) {
      await FeedbackModel.create({
        user_id,
        timestamp,
        feedback,
      });
      return res
        .status(201)
        .json({ message: "Feedback created successfully!", status: 201 });
    } else {
      await FeaturesModel.create({
        user_id,
        timestamp,
        feature_request,
      });
      return res.status(201).json({
        message: "Feature Request created successfully!",
        status: 201,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", status: 500 });
  }
};

const getAllFeedBack = async (req, res) => {
  try {
    const allFeedbacks = await FeedbackModel.findAll();
    res.status(200).json({
      message: "All Feedbacks Fetched successfully",
      status: 200,
      data: allFeedbacks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", status: 500 });
  }
};

const getAllFeatureRequests = async (req, res) => {
  try {
    const allFeatureRequests = await FeaturesModel.findAll();
    res.status(200).json({
      message: "All Feature requests fetched successfully",
      status: 200,
      data: allFeatureRequests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", status: 500 });
  }
};

module.exports = { sendRequest, getAllFeedBack, getAllFeatureRequests };
