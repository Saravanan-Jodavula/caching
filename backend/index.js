const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors({
    origin: '*',
  }));
  
console.log(cors())
app.use(express.json());
const RedisCache = require('express-redis-cache');
const pg = require('pg');
const knex = require('knex');
const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log(process.env.TOKEN_SECRET);
// PostgreSQL setup
const pgClient = new pg.Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
pgClient.connect();
// Redis cache setup
const cache = RedisCache({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT, auth_pass: process.env.REDIS_PASSWORD });

// Knex setup
const knexInstance = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
});

// Middleware to validate the security token
const authenticateToken = (req, res, next) => {
    next();
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (token == null) return res.sendStatus(401);

//   jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
};
app.get('/api/reports', (req, res) => {
    knexInstance.select('*').from('reports').then((data) => {
        console.log(data);
        res.json(data);
        })
        .catch((error) => { 
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// API endpoint to generate JSON based on query parameters
app.get('/api/misReports', authenticateToken, (req, res) => {
    console.log(req.query);
    const { report_type, clear } = req.query;
    if(clear){
        const invalidateCache = (reportType) => {
            cache.client.del(reportType, (error, response) => {
                if (error) {
                  console.error(error);
                } else {
                  console.log(`Cache invalidated for report type: ${reportType}`);
                }
              });
          };
          console.log(invalidateCache(report_type));
          return;
    }
    // Check if the data is available in the cache
    cache.get(report_type, (error, cachedData) => {
        console.log(error, cachedData);
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (cachedData !== null && cachedData.length > 1) {
        res.json(cachedData.map((item) => { return {...item, ...item.data}}));
    }
  
      // Fetch data from the database using Knex
      knexInstance
        .select('*')
        .from('reports')
        .where('report_type', report_type)
        // .paginate({ perPage: 10, currentPage: req.query.page || 1 })
        .then((data) => {
          // Store data in cache
          const cacheData = data.map((item) => {
            // Convert each item into key-value pairs
            return [
              `field:${item.id}`,
              JSON.stringify(item),
            ];
          });
          
          // Use the HMSET command with the correct arguments
          cache.client.hmset(report_type, ...cacheData, (error) => {
            if (error) {
              console.error(error);
            }
          });
  
          res.json(data.map((item) => { return {...item, ...item.data}}));
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });
  });
  

// Start the server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
