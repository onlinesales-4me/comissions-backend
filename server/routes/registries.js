const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
let auth = require('../middleware/authValidator');


/* GET REGISTRY  */
router.get('/', auth.verifyAuthentication, async (req, res) =>  {
    const client = await pool.connect();
    try {
        let query = "select * from Templates where  UPPER(name) = UPPER($1) and validityEnd = $2";
        let values = [req.query.name, '1964-05-28'];
        const registries = await client.query(query, values);
        client.release(true);
        res.status(200).send({registries: registries});
    } catch (err) {
        client.release(true);
        res.status(500);
        res.send(err.message);
    }
});

/* CREATE REGISTRY  */
router.post('/', async (req, res) =>  {
    const client = await pool.connect();
    try {
        let today = new Date();
        let month = today.getMonth()+1;
        if(month.toString().length == 1)
            month = '0'+month;
        let date = today.getDate();
        if(date.toString().length == 1)
            date = '0'+date;
        let query = "insert into Registries (ip, description, date) values ($1,  $2, $3)";
        let values = [req.body.ip, req.body.description, today.getFullYear()+"-"+month+"-"+date+" "+today.getHours()+":"+today.getMinutes()+":"+today.getSeconds()];
        const registries = await client.query(query, values);
        client.release(true);
        res.status(200).send({message: 'Exito'});
    } catch (err) {
        client.release(true);
        res.status(500);
        res.send(err.message);
    }
});




module.exports = router
