const { Pool } = require('pg')
const result = require('dotenv').config({path: './local.env'});

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: 5432,
    max: 10,
    ssl: true
})

module.exports = {
    pool
}

/* const postgres = require('postgres');
const result = require('dotenv').config({path: './local.env'});

const sql = postgres({
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: 5432,
    max: 10
});

module.exports = {
    sql
} */

/* let configPool  = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    stream: true,
    pool: {
        max: 40,
        min: 0,
        idleTimeoutMillis: 60000
    },
    options: {
        useUTC: false
    }
}

const poolPromise = new sql.ConnectionPool(configPool)
.connect()
.then(pool => {
    console.log('Connected to MSSQL')
    return pool
})
.catch(err => console.log('Database Connection Failed! Bad Config: ', err))

module.exports = {
    sql, poolPromise
}   */