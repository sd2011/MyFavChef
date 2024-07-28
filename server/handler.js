const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

module.exports.randomVideo = async (event) => { 
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(dbConfig);
     connection.query(`
      SELECT videoId
      FROM Videos
      ORDER BY RAND()
      LIMIT 1
    `, (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        return reject({
          message: 'Error connecting to the database or fetching video',
          error: error.message || error,
        });
      }
      console.error('Results:', results);
      if (Array.isArray(results) && results.length > 0) {
        console.log('Query result:', results);
        resolve({
          statusCode: 200,
          body: JSON.stringify(
            results[0].videoId, 
          ),
        });
      } else {
        reject({
          message: 'No results found',
        });
      }
    });
  });

};

module.exports.insertData = async (event) => {
  return new Promise((resolve, reject) => {
  
  let connection;
    // Read JSON file
    const data =  fs.readFileSync('uniqueVideos.json', 'utf-8');
    const videos = JSON.parse(data);
    console.error('Videos:', videos);

    // Connect to the database
    connection = mysql.createConnection(dbConfig);

    // Insert data into the database
    const values = videos.map(video => [video.videoId, video.title]);

    // Construct batch insert query
    const insertQuery = 'INSERT INTO Videos (videoId, title) VALUES ?';

    // Execute batch insert
     connection.query(insertQuery, [values], (error, results) => {
      if (error) {
        console.error('Error inserting data:', error);
        reject({
           message: 'Error inserting data', error })
      }

      console.error('Insert results:', results);
      resolve({
        statusCode: 200,
        body: JSON.stringify({ message: 'Data inserted successfully', results })
      });

    }

    );
  });
};


module.exports.createTable = async (event) => {
  const connection = mysql.createConnection(dbConfig);

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Videos (
      videoId VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      PRIMARY KEY (videoId)
    )
  `;

  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        reject({
          statusCode: 500,
          body: JSON.stringify({ message: 'Error connecting to the database', error: err })
        });
        return;
      }

      connection.query(createTableQuery, (err, results) => {
        if (err) {
          console.error('Error creating table:', err);
          reject({
            statusCode: 500,
            body: JSON.stringify({ message: 'Error creating table', error: err })
          });
        } else {
          resolve({
            statusCode: 200,
            body: JSON.stringify({ message: 'Table created successfully', results })
          });
        }

        connection.end();
      });
    });
  });
};