const LogsModel = require("../../models/logs/logsModel");

const SendLogs = async (req, res) => {
  try {
    const {
      user_id,
      api_type,
      api_status,
      api_request_body,
      api_request_response,
      event,
      app_error,
      device_model,
      os_platform,
      os_version,
      latitude,
      longitude,
      request_timestamp,
      response_timestamp,
      session_started_timestamp,
      last_session_end_timestamp,
    } = req.body;
    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required",
        status: 400,
      });
    }
    await LogsModel.create({
      user_id,
      api_type,
      api_status,
      api_request_body,
      api_request_response,
      event,
      app_error,
      device_model,
      os_platform,
      os_version,
      latitude,
      longitude,
      request_timestamp,
      response_timestamp,
      session_started_timestamp,
      last_session_end_timestamp,
    });

    res.status(201).json({
      message: "Log recorded successfully",
      status: 201,
    });
  } catch (error) {
    return res.status(400).json({
      message: error,
      status: 400,
    });
  }
};

module.exports = { SendLogs };
