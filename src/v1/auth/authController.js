const pool = require("../config/db");

const registerUser = (req, res) => {
    const {
      user_id,
      name,
      location,
      bio,
      skills,
      interest,
      imageURL,
      username,
      active_collab,
      social_account,
      collab_count
    } = req.body;
  
    pool.query(
      'SELECT * FROM users_profile WHERE user_id = $1',
      [user_id],
      (error, results) => {
        if (error) {
          console.error('Error checking for existing user:', error);
          return res.status(500).json({
            message: 'Internal Server Error',
            status: '500',
          });
        }
  
        if (results.rows.length > 0) {
          return res.status(409).json({
            message: 'User ID already exists',
            status: '409',
            data:[{}]
          });
        }
  
        pool.query(
          'INSERT INTO users_profile (user_id, name, location, bio, skills, interest, imageURL, username, active_collab, social_account, collab_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [user_id, name, location, bio, skills, interest, imageURL,username,active_collab,social_account,collab_count],
          (error, results) => {
            if (error) {
              console.error('Error inserting data:', error);
              return res.status(500).json({
                message: 'Internal Server Error',
                status: '500',
              });
            }
            res.status(201).json({
              message: 'User Created!!',
              status: '201',
              data: [{ UserID: user_id }],
            });
          }
        );
      }
    );
  };

  module.exports={registerUser};