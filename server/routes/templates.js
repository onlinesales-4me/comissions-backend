const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
let auth = require('../middleware/authValidator');


/* GET TEMPLATE  */
router.get('/', async (req, res) =>  {
    const client = await pool.connect();
    try {
        let query = "select * from Templates";
        let values = [];
        const templates = await client.query(query, values);

        const gettemplatefields = async (templates) => {
            for (let index = 0; index < templates.length; index++) {
                let queryFields = "select  * from templatefields where templateid = $1";
                let valuesFields = [templates[index].id];
                const templatefields = await client.query(queryFields, valuesFields);
                templates[index].fields = templatefields.rows;
                let queryValues = "select  * from "+templates[index].name+'_'+templates[index].validitystart.getFullYear()+'_'+(templates[index].validitystart.getMonth()+1)+'_'+templates[index].validitystart.getDate()+'_'+templates[index].validitystart.getHours()+'_'+templates[index].validitystart.getMinutes()+'_'+templates[index].validitystart.getSeconds()+" where aCt1v3 = $1";
                let valuesValues = [true];
                const templateValues = await client.query(queryValues, valuesValues);
                templates[index].values = templateValues.rows;
                var nameFields = '', photoField = '';
                for (let i = 0; i < templates[index].fields.length; i++) {
                    if(templates[index].fields[i].isObjectTitle) {
                        nameFields = templates[index].fields[i].name.toLowerCase();
                    }
                    if(templates[index].fields[i].object.localeCompare('photo') === 0) {
                        photoField = templates[index].fields[i].name.toLowerCase();
                    }
                    if(templates[index].fields[i].object.localeCompare('gallery') === 0) {
                        for (let j = 0; j < templates[index].values.length; j++) {
                            templates[index].values[j][templates[index].fields[i].name.toLowerCase()] = templates[index].values[j][templates[index].fields[i].name.toLowerCase()].split(";");
                        }
                    } else if(templates[index].fields[i].object.localeCompare('list_gallery') === 0) {
                        for (let j = 0; j < templates[index].values.length; j++) {
                            let listaString = templates[index].values[j][templates[index].fields[i].name.toLowerCase()].split(";");
                            let lista = [];
                            for (let k = 0; k < listaString.length; k++) {
                                let tile = listaString[k].split('|');
                                lista.push({text: tile[0].split('=')[1], url: tile[1].split('=')[1]})
                            }
                            templates[index].values[j][templates[index].fields[i].name.toLowerCase()] = lista;
                        }
                    } else if(templates[index].fields[i].object.localeCompare('phone_number') === 0) {
                        for (let j = 0; j < templates[index].values.length; j++) {
                            templates[index].values[j][templates[index].fields[i].name.toLowerCase()] = {phone: templates[index].values[j][templates[index].fields[i].name.toLowerCase()].split(';')[0].split('=')[1], message: templates[index].values[j][templates[index].fields[i].name.toLowerCase()].split(';')[1].split('=')[1]};
                        }
                    }
                }
                for (let i = 0; i < templates[index].values.length; i++) {
                    if(nameFields.length > 0) {
                        templates[index].values[i].officialName = templates[index].values[i][nameFields];
                    } else {
                        templates[index].values[i].officialName = '';
                    }
                    if(photoField.length > 0) {
                        templates[index].values[i].officialCover = templates[index].values[i][photoField];
                    } else {
                        templates[index].values[i].officialCover = 'http://localhost:8000/640x360.png';
                    }
                }
            }
            client.release(true);
            res.status(200).send({ templates: templates});
        }
        gettemplatefields(templates.rows);
    } catch (err) {
        client.release(true);
        console.log('err', err);
        res.status(500);
        res.send(err.message);
    }
});

/* CREATE TEMPLATE  */
router.post('/', auth.verifyAuthentication, async (req, res) =>  {
    const client = await pool.connect();
    try {
        const checkTemplateExistsOnDatabase = async () => {
            let query = "select * from Templates where  UPPER(name) = UPPER($1) and validityend = $2";
            let values = [req.query.name, '1964-05-28'];
            const template = await client.query(query, values);
            if (template.rows.length !== 0) {
                client.release(true);
                res.status(403).send({ message: 'Nombre de plantilla ya existente'});
            } else {
                createTemplateTable();
            }
        }
        const createTemplateTable = async () => {
            //NOMBRE TABLA: NOMBREVARIABLE_AÑOVIGENCIA_MESVIGENCIA_DIAVIGENCIA_HORAVIGENCIA_MINUTOSVIGENCIA_SEGUNDOSVIGENCIA
            let today = new Date();
            var tableCreationQuery = 'CREATE TABLE '+req.body.name+'_'+today.getFullYear()+'_'+(today.getMonth()+1)+'_'+today.getDate()+'_'+today.getHours()+'_'+today.getMinutes()+'_'+today.getSeconds()+' ( id SERIAL PRIMARY KEY, ';
            for (var i = 0; i < req.body.fields.length; i++) {
                if(i != 0)
                    tableCreationQuery += ', ';
                if(req.body.fields[i].type.localeCompare("decimal") == 0) {
                    tableCreationQuery += req.body.fields[i].name+' decimal(22,4)';
                } else if(req.body.fields[i].type.localeCompare("int") == 0) {
                    tableCreationQuery += req.body.fields[i].name+' int';
                } else if(req.body.fields[i].type.localeCompare("string") == 0) {
                    tableCreationQuery += req.body.fields[i].name+' varchar(1000)';
                } else if(req.body.fields[i].type.localeCompare("boolean") == 0) {
                    tableCreationQuery += req.body.fields[i].name+' boolean';
                } else if(req.body.fields[i].type.localeCompare("date") == 0) {
                    tableCreationQuery += req.body.fields[i].name+' date';
                }
            };
            tableCreationQuery += ', f3ch4Gu4rd4do date, aCt1v3 boolean )';
            let values = [];
            const createTable = await client.query(tableCreationQuery, values);
            createTemplate(today);
        }
        const createTemplate = async (today) => {
            let month = today.getMonth()+1;
            if(month.toString().length == 1)
                month = '0'+month;
            let date = today.getDate();
            if(date.toString().length == 1)
                date = '0'+date;
            let query ="insert into Templates (name, validitystart, validityend) values ($1, $2, $3)";
            let values = [req.body.name, today.getFullYear()+"-"+month+"-"+date+" "+today.getHours()+":"+today.getMinutes()+":"+today.getSeconds(), '1964-05-28'];
            const insertTemplate = await client.query(query, values);
            gettemplateid();
        };
        const gettemplateid = async () => {
            let query ="select * from Templates order by id desc limit 1";
            let values = [];
            const template = await client.query(query, values);
            for (let i = 0; i < req.body.fields.length; i++) {
                createTemplateField(req.body.fields[i], template.rows[0].id, i, req.body.fields.length);
            }
        };
        const createTemplateField = async (templateField, templateid, currentIndex, lastIndex) => {
            let query ="insert into templatefields (name, type, object, orderPresentation, showCover, searchable, isObjectTitle, templateid) values ($1, $2, $3, $4, $5, $6, $7, $8)";
            let values = [templateField.name, templateField.type, templateField.object, templateField.orderPresentation, templateField.showCover, templateField.searchable, templateField.isObjectTitle, templateid];
            const template = await client.query(query, values);
            if(currentIndex === lastIndex-1) {
                client.release(true);
                res.status(200).send({ message: 'Exito'});
            }
        };
        checkTemplateExistsOnDatabase();
    } catch (err) {
        client.release(true);
        console.log('err', err);
        res.status(500);
        res.send(err.message);
    }
});

/* CREATE TEMPLATE  */
router.put('/', auth.verifyAuthentication, async (req, res) =>  {
    const client = await pool.connect();
    try {
        const checkTemplateExistsOnDatabase = async () => {
            let query = "select * from Templates where  UPPER(name) = UPPER($1) and validityend = $2";
            let values = [req.query.name, '1964-05-28'];
            const template = await client.query(query, values);
            if (template.rows.length !== 0) {
                client.release(true);
                res.status(403).send({ message: 'Nombre de plantilla ya existente'});
            } else {
                deactivateTemplateOnDatabase(template.rows[0]);
            }
        }
        const deactivateTemplateOnDatabase = async (template) => {
            let today = new Date();
            let month = today.getMonth()+1;
            if(month.toString().length == 1)
                month = '0'+month;
            let date = today.getDate();
            if(date.toString().length == 1)
                date = '0'+date;
            let query = "update Templates set validityend = $1 where id = $2";
            let values = [today.getFullYear()+"-"+month+"-"+date, template.id];
            const updateTemplate = await client.query(query, values);
            createTemplateTable();
        }
        const createTemplateTable = async () => {
            //NOMBRE TABLA: NOMBREVARIABLE_AÑOVIGENCIA_MESVIGENCIA_DIAVIGENCIA_HORAVIGENCIA_MINUTOSVIGENCIA_SEGUNDOSVIGENCIA
            let today = new Date();
            var tableCreationQuery = 'CREATE TABLE '+req.body.name+'_'+today.getFullYear()+'_'+(today.getMonth()+1)+'_'+today.getDate()+'_'+today.getHours()+'_'+today.getMinutes()+'_'+today.getSeconds()+' ( id SERIAL PRIMARY KEY, ';
            for (var i = 0; i < req.body.fields.length; i++) {
                if(i != 0)
                    tableCreationQuery += ', ';
                if(req.body.fields[i].type.localeCompare("decimal") == 0) {
                    tableCreationQuery += req.body.fields[i].name+' decimal(22,4)';
                } else if(req.body.fields[i].type.localeCompare("int") == 0) {
                    tableCreationQuery += req.body.fields[i].name+' int';
                } else if(req.body.fields[i].type.localeCompare("string") == 0) {
                    tableCreationQuery += req.body.fields[i].name+' varchar(1000)';
                } else if(req.body.fields[i].type.localeCompare("boolean") == 0) {
                    tableCreationQuery += req.body.fields[i].name+' boolean';
                } else if(req.body.fields[i].type.localeCompare("date") == 0) {
                    tableCreationQuery += req.body.fields[i].name+' date';
                }
            };
            tableCreationQuery += ', f3ch4Gu4rd4do date, aCt1v3 boolean )';
            let values = [];
            const createTable = await client.query(tableCreationQuery, values);
            createTemplate(today);
        }
        const createTemplate = async (today) => {
            let month = today.getMonth()+1;
            if(month.toString().length == 1)
                month = '0'+month;
            let date = today.getDate();
            if(date.toString().length == 1)
                date = '0'+date;
            let query ="insert into Templates (name, validitystart, validityend) values ($1, $2, $3)";
            let values = [req.body.name, today.getFullYear()+"-"+month+"-"+date+" "+today.getHours()+":"+today.getMinutes()+":"+today.getSeconds(), '1964-05-28'];
            const insertTemplate = await client.query(query, values);
            gettemplateid();
        };
        const gettemplateid = async () => {
            let query ="select * from Templates order by id desc limit 1";
            let values = [];
            const template = await client.query(query, values);
            for (let i = 0; i < req.body.fields.length; i++) {
                createTemplateField(req.body.fields[i], template.rows[0].id, i, req.body.fields.length);
            }
        };
        const createTemplateField = async (templateField, templateid, currentIndex, lastIndex) => {
            let query ="insert into templatefields (name, type, object, orderPresentation, showCover, searchable, isObjectTitle, templateid) values ($1, $2, $3, $4, $5, $6, $7, $8)";
            let values = [templateField.name, templateField.type, templateField.object, templateField.orderPresentation, templateField.showCover, templateField.searchable, templateField.isObjectTitle, templateid];
            const template = await client.query(query, values);
            if(currentIndex === lastIndex-1) {
                client.release(true);
                res.status(200).send({ message: 'Exito'});
            }
        };

        checkTemplateExistsOnDatabase();
    } catch (err) {
        client.release(true);
        console.log('err', err);
        res.status(500);
        res.send(err.message);
    }
});




module.exports = router
