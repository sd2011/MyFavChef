const mysql = require('mysql');
const xml2js = require('xml2js');


const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const tableName = 'Videos';

module.exports.randomVideo = async (event) => { 
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(dbConfig);
     connection.query(`
      SELECT videoId
      FROM ${tableName}
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

module.exports.youtubeWebhook = async (event) => {
  return new Promise(async (resolve, reject) => {
    const headers = event.headers;
    const body = event.body;
    if (headers['X-Hub-Signature']) {
      const signature = headers['X-Hub-Signature'].split('=')[1];
      if (!verifySignature(body, signature, process.env.HUB_SECRET)) {
        console.error('Invalid signature');
        return {
          statusCode: 403,
          body: 'Forbidden'
        };
      }
    }

    if (event.queryStringParameters && event.queryStringParameters['hub.challenge']) {
      console.error('Verification request');
      return {
        statusCode: 200,
        body: event.queryStringParameters['hub.challenge']
      };
    }
    const parser = new xml2js.Parser();
    const feed = await parser.parseStringPromise(body);
    const connection = await mysql.createConnection(dbConfig);

    const values = feed.feed.entry.map((entry) => [entry['yt:videoId'][0], entry['title'][0]]);
    const insertQuery = `INSERT INTO ${tableName} (videoId, title) VALUES ?`;

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
    });
  });
  
};

const verifySignature = (payload, signature, secret) => {
const crypto = require('crypto');

  const mac = crypto.createHmac('sha1', secret).update(payload).digest('hex');
  console.error('MAC:', mac);
  return crypto.timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(signature, 'hex'));
}
