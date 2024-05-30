const pool = require("../config/db");

const deleteCollab = (req, res) => {
  const collab_id = req.params.collab_id;

  if (!collab_id) {
    return res.status(400).json({ error: "collab_id is required" });
  }

  const query = "DELETE FROM collabs WHERE collab_id = $1";
  const values = [collab_id];
  
  pool.query(query, values,(error,results)=>{
    if(error) throw error;
    res.status(200).json({ message: "Collab record deleted successfully" });
});

};

const getAllCollabs = (req, res) => {
    pool.query("SELECT * from collabs", (error, results) => {
      if (error) throw error;
      res.status(200).json(results.rows);
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
  
      res.status(200).json({ message: 'Collab record updated successfully' });
    } catch (err) {
      console.error('Error executing query', err);
      res.status(500).json({ error: 'An error occurred while updating the collab record' });
    }
  };
  
  const createCollab = (req, res) => {
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
  
    const query = `
      INSERT INTO collabs (user_id, title, location, tags, description, collab_mode, payment, due_date, type, bookmark_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING collab_id
    `;
    const values = [
      user_id, title, location, tags, description, collab_mode, payment, due_date, type, bookmark_count
    ];
  
   pool.query(query, values,(errors,results)=>{
    if(errors) throw errors;
    res.status(201).json({ message: 'Collab created successfully', data: {Collab_ID:results.rows[0].collab_id},status:200 });

   });
    
      
    
  }
  module.exports = { updateCollab,getAllCollabs,deleteCollab,createCollab };
  