const mysql = require('mysql');


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
          headers: {
      'Access-Control-Allow-Origin': "*", // <-- Add your specific origin here
      'Access-Control-Allow-Credentials': true,
    },
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
