const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
let auth = require('../middleware/authValidator');


/* CREATE REGISTRY  */
router.post('/', auth.verifyAuthentication, async (req, res) =>  {
    const client = await pool.connect();
    try {
        let hoy = new Date();
        req.body.template.validitystart = new Date(req.body.template.validitystart);
        var sqlQuery = 'INSERT INTO '+req.body.template.name+'_'+req.body.template.validitystart.getFullYear()+'_'+(req.body.template.validitystart.getMonth()+1)+'_'+req.body.template.validitystart.getDate()+'_'+req.body.template.validitystart.getHours()+'_'+req.body.template.validitystart.getMinutes()+'_'+req.body.template.validitystart.getSeconds()+' ( ';
        for (var i = 0; i < req.body.template.fields.length; i++) {
            if(i != 0)
                sqlQuery += ', ';
                sqlQuery += req.body.template.fields[i].name;
        };
        sqlQuery += ', f3ch4Gu4rd4do, aCt1v3 ) values ( ';
        let values = [];
        for (var j = 0; j < req.body.template.fields.length; j++) {
            if(j > 0)
                sqlQuery += ', ';
            sqlQuery += '$'+(j+1);
            values.push(req.body.templateObject[req.body.template.fields[j].name]);
        };
        sqlQuery += ", '"+hoy.getFullYear()+"-"+(hoy.getMonth()+1)+"-"+hoy.getDate()+"', 'true' )";
        const template = await client.query(sqlQuery, values);
        res.status(200).send({message: 'exito'});
        client.release(true);
    } catch (err) {
        console.log("err", err)
        res.status(500);
        res.send(err.message);
        client.release(true);
    }
});

/* UPDATE REGISTRY  */
router.put('/', auth.verifyAuthentication, async (req, res) =>  {
    const client = await pool.connect();
    try {
        req.body.template.validitystart = new Date(req.body.template.validitystart);
        var sqlQuery = 'UPDATE '+req.body.template.name+'_'+req.body.template.validitystart.getFullYear()+'_'+(req.body.template.validitystart.getMonth()+1)+'_'+req.body.template.validitystart.getDate()+'_'+req.body.template.validitystart.getHours()+'_'+req.body.template.validitystart.getMinutes()+'_'+req.body.template.validitystart.getSeconds();
        sqlQuery += " set aCt1v3 = $1 where id = $2";
        let values = [false, req.body.templateObject["id"]];

        const template = await client.query(sqlQuery, values);
        res.status(200).send({message: 'exito'});
        client.release(true);
    } catch (err) {
        res.status(500);
        res.send(err.message);
        client.release(true);
    }
});




module.exports = router;