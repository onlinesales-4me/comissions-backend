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
        console.log("err", err);
        res.status(500);
        res.send(err.message);
    }
});

/* CREATE REGISTRY  */
router.post('/', auth.verifyAuthentication, async (req, res) =>  {
    try {
        pool.connect( async (err, client, done) => {
            if (err) throw err
            const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
            let query = "insert into Users (name, username, password, active) values ($1, $2, $3, $4)";
            let values = [req.body.name, req.body.username, hashPassword, true];
            const user = await client.query(query, values);
            res.status(200).send({message: 'Exito'});
        })
    } catch (err) {
        console.log("err", err);
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
        console.log("err", err);
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
        console.log("err", err);
        res.status(500);
        res.send(err.message);
    }
});




module.exports = router
