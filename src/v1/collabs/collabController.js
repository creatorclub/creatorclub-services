const pool = require("../config/db");

const deleteCollab = (req, res) => {
  const collab_id = req.params.collab_id;

  if (!collab_id) {
    return res.status(400).json({ error: "collab_id is required" ,status:400});
  }

  const query = "DELETE FROM collabs WHERE collab_id = $1";
  const values = [collab_id];
  
  pool.query(query, values,(error,results)=>{
    if(error) throw error;
    res.status(202).json({ message: "Collaboration deleted successfully" ,status:202});
});

};

const getAllCollabs = (req, res) => {
    pool.query("SELECT * from collabs", (error, results) => {
      if (error) throw error;
      res.status(200).json({message:"All Collaboration Fetched successfully",status:200,data:results.rows});
    });
  };

  const updateCollab = (req, res) => {
    const collab_id = req.params.collab_id;
    const fields = req.body;
  
    if (!collab_id) {
      return res.status(400).json({ error: 'collab_id is required' });
    }
  
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }
  
    try {
      let query = 'UPDATE collabs SET ';
      const values = [];
      let index = 1;
  
      for (const [key, value] of Object.entries(fields)) {
        query += `${key} = $${index}, `;
        values.push(value);
        index++;
      }
  
      query = query.slice(0, -2);
      query += ` WHERE collab_id = $${index}`;
      values.push(collab_id);
  
       pool.query(query, values);
  
      res.status(200).json({ message: 'Collaboration updated successfully' ,status:200});
    } catch (err) {
      console.error('Error executing query', err);
      res.status(500).json({ error: 'An error occurred while updating the Collaboration' });
    }
  };
  
  const createCollab = async (req, res) => {
    const {
      user_id,
      title,
      location,
      tags,
      description,
      collab_mode,
      payment,
      due_date,
      type,
      bookmark_count
    } = req.body;
  
    const insertCollabQuery = `
      INSERT INTO collabs (user_id, title, location, tags, description, collab_mode, payment, due_date, type, bookmark_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING collab_id
    `;
    const collabValues = [
      user_id, title, location, tags, description, collab_mode, payment, due_date, type, bookmark_count
    ];
  
    try {
      const collabResult = await pool.query(insertCollabQuery, collabValues);
      const newCollabId = collabResult.rows[0].collab_id;
  
      const userQuery = 'SELECT active_collab FROM users_profile WHERE user_id = $1';
      const userResult = await pool.query(userQuery, [user_id]);
  
      if (!userResult || !userResult.rows || userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' ,status:404});
      }
  
      const currentActiveCollab = userResult.rows[0].active_collab || [];
  
      const updatedActiveCollab = [...currentActiveCollab, newCollabId];
  
      const updateUserQuery = 'UPDATE users_profile SET active_collab = $1 WHERE user_id = $2';
      await pool.query(updateUserQuery, [updatedActiveCollab, user_id]);
  
      res.status(201).json({ message: 'Collaboration created successfully', status: 200, data: { Collab_ID: newCollabId } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error',status:500 });
    }
  };
  module.exports = { updateCollab,getAllCollabs,deleteCollab,createCollab };
  