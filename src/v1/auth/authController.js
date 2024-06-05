const pool = require("../config/db");

const AuthenticateUser = (req, res) => {
    const {
      user_id,
      email,
      username
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
          message: 'User ID is required',
          status: '400',
      });
  }
  
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
          return res.status(200).json({message:"User verified",status:200,data:results.rows})
        }
        
        pool.query('INSERT INTO users_profile (user_id,email,username) VALUES ($1, $2, $3)',
            [user_id,email,username],(err,res1)=>{
              if(err) throw err;
              res.status(201).json({
                message: 'User ID created',
                status: '201',
                data:user_id
              });
            }
          )
           
        
      }
    );
  };

  module.exports={AuthenticateUser};