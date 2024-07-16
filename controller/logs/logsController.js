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
      session_started_timestamp
    });

    res.status(201).json({
      message: "Log recorded successfully",
      status: 201,
    });
  } catch (error) {
    return res.status(500).json({  // Changed to 500 for internal server errors
      message: error.message || "Internal server error",
      status: 500,
    });
  }
};

const GetLogs = async (req, res) => {
  try {
    const logs = await LogsModel.findAll({
      limit: 50,
      order: [['log_id', 'DESC']]
    });

    res.status(200).json({
      message: "Logs fetched successfully",
      status: 200,
      data: logs,
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch logs",
      status: 500,
    });
  }
};


module.exports = { SendLogs, GetLogs };