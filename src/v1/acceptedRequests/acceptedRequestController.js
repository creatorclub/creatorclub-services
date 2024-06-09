const pool = require("../config/db");

const sendRequest = (req, res) => {
  const { collab_id, requested_from, requested_to, time } = req.body;
  const status = "Pending";
  pool.query(
    "INSERT INTO accepted_requests (collab_id,requested_from,requested_to,status,time) VALUES ($1,$2,$3,$4,$5) RETURNING request_id",
    [collab_id, requested_from, requested_to, status, time],
    (error, results) => {
      if (error) throw error;
      res.status(200).send({
        message: "Collaboration request details stored successfully",
        status: 200,
        data: { request_id: results.rows[0].request_id },
      });
    }
  );
};

const updateStatus = (req, res) => {
  const { request_id, status } = req.body;

   pool.query(
    "UPDATE accepted_requests SET status = $1 WHERE request_id = $2 RETURNING request_id, status",
    [status, request_id],
    (error, results) => {
      if (error) {
        res.status(500).json({
          message: "An error occurred while updating the status",
          status: 500,
          error: error.message,
        });
      } else if (results.rowCount === 0) {
        res.status(404).json({
          message: "Request ID not found",
          status: 404,
        });
      } else {
        res.status(200).json({
          message: `Request ${status} successfully`,
          status: 200,
          data: {},
        });
      }
    }
  );
};

module.exports = { sendRequest,updateStatus };
