const express = require('express');
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/uploads/images');
    },
    filename: function (req, file, cb) {
        let fileType = 'png';
        if(file.mimetype.includes('png')) {
            fileType = '.png';
        } else if(file.mimetype.includes('jpg')) {
            fileType = '.jpg';
        } else if(file.mimetype.includes('jpeg')) {
            fileType = '.jpeg';
        }
        cb(null, file.fieldname + '-' + Date.now()+fileType);
    }
})
const upload = multer({storage: storage});
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('server/uploads/images'));

require('./routes')(app);

app.post('/upload-photo', upload.single('pic'), (req, res) => {
    if(req.file) {
        res.json(req.file);
    }
    else throw 'error';
});

/* app.post('/upload-photo', (req, res) => {
    // 'profile_pic' is the name of our file input field in the HTML form
    let upload = multer({ storage: storage }).single('pic');

    upload(req, res, function(err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any
        console.log("1", req.file);

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }

        // Display uploaded image for user validation
        res.send(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
    });
}); */

app.post('/upload-gallery', upload.array('pic'), (req, res) => {
    if(req.files) {
        res.json(req.files);
    }
    else throw 'error';
});

/* app.post('/upload-gallery', (req, res) => {
    // 'profile_pic' is the name of our file input field in the HTML form
    let upload = multer({ storage: storage }).array('pic');

    upload(req, res, function(err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any
        console.log("2", req.files);

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.files) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }

        // Display uploaded image for user validation
        res.send(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
    });
}); */

app.post('/delete', (req, res) => {
    fs.stat(req.body.file, function (err, stats) {
        if (err) {
            return console.error(err);
        }
        fs.unlink(req.body.file,function(err){
            if(err) return console.log(err);
            console.log('file deleted successfully');
        });  
     });
});

app.listen(PORT, () => {
    console.log('Listening at ' + PORT );
});