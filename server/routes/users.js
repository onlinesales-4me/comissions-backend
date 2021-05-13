const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
require('dotenv').config();
let auth = require('../middleware/authValidator');


/* GET REGISTRY  */
router.get('/', auth.verifyAuthentication, async (req, res) =>  {
    try {
        pool.connect( async (err, client, done) => {
            if (err) throw err
            let query = "select * from Users";
            let values = [];
            const users = await client.query(query, values);
            res.status(200).send({ users: users.rows});
        })
    } catch (err) {
        res.status(500);
        res.send(err.message);
    }
});

/* CREATE REGISTRY  */
router.post('/', auth.verifyAuthentication, async (req, res) =>  {
    try {
        pool.connect( async (err, client, done) => {
            if (err) throw err
            let query = "insert into Users (name, username, password, active) values ($1, $2, $3, $4)";
            let values = [req.body.name, req.body.username, req.body.password, true];
            const user = await client.query(query, values);
            res.status(200).send({message: 'Exito'});
        })
    } catch (err) {
        res.status(500);
        res.send(err.message);
    }
});

/* CREATE REGISTRY  */
router.post('/create',  async (req, res) =>  {
    try {
        const hashPassword = await bcrypt.hash('admin123', saltRounds);

        pool.connect( async (err, client, done) => {
            if (err) throw err
            let query = "insert into Users (name, username, password, active) values ($1, $2, $3, $4)";
            let values = ['admin', 'admin', hashPassword, true];
            const user = await client.query(query, values);
            res.status(200).send({message: 'Exito'});
        })
    } catch (err) {
        res.status(500);
        res.send(err.message);
    }
});

router.post('/tables',  async (req, res) =>  {
    try {
        const hashPassword = await bcrypt.hash('admin123', saltRounds);

        pool.connect( async (err, client, done) => {
            if (err) throw err
            let queryTemplates = "create table templates ( id serial PRIMARY KEY, name varchar(100) NOT NULL, validitystart timestamp NOT NULL, validityend date NOT NULL )";
            let values = [];
            const user = await client.query(queryTemplates, values);
            let queryTemplateFields = "create table templatefields ( id serial PRIMARY KEY, name varchar(100) NOT NULL, type varchar(30) NOT NULL, object varchar(30) NOT NULL, orderpresentation int NOT NULL, showcover boolean NOT NULL, searchable boolean NOT NULL, isobjecttitle boolean NOT NULL, templateid int NOT NULL )";
            const user2 = await client.query(queryTemplateFields, values);
            let queryRegistries = "create table registries ( id serial PRIMARY KEY, ip varchar(30) NOT NULL, description varchar(500) UNIQUE NOT NULL, date timestamp NOT NULL )";
            const user3 = await client.query(queryRegistries, values);
            let queryUsers = "create table users ( id serial PRIMARY KEY, name varchar(50) NOT NULL, username varchar(50) UNIQUE NOT NULL, password varchar(150) NOT NULL, active boolean NOT NULL )";
            const user4 = await client.query(queryUsers, values);
            res.status(200).send({message: 'Exito'});
        })
    } catch (err) {
        res.status(500);
        res.send(err.message);
    }
});

router.post('/login', async (req, res) =>  {
    try {
        pool.connect( async (err, client, done) => {
            if (err) throw err
            let query = "select * from Users where username = $1";
            let values = [req.body.username];
            const user = await client.query(query, values);
            if(user.rows === 0) {
                res.status(404).send({message: 'Usuario no encontrado.'});
            } else {
                const comparePasswords = async (userQuery) => {
                    const match = await bcrypt.compare(req.body.password, userQuery.password);
                    if(match) {
                        const user = {username: userQuery.username, name: userQuery.name}
                        const accesToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                        res.status(200).send({message: 'Autorizado', accessToken: accesToken});
                    } else {
                        res.status(404).send({message: 'Contraseña incorrecta.'});
                    }
                }
                comparePasswords(user.rows[0]);
            }
        })
    } catch (err) {
        res.status(500);
        res.send(err.message);
    }
});

router.put('/deactivate', auth.verifyAuthentication, async (req, res) =>  {
    try {
        pool.connect( async (err, client, done) => {
            if (err) throw err
            let query = "update Users set active = $1 where id = $2";
            let values = [false, req.body.id];
            const user = await client.query(query, values);
            res.status(200).send({message: 'Usuario modificado con exito.'});
        })
    } catch (err) {
        res.status(500);
        res.send(err.message);
    }
});




module.exports = router
