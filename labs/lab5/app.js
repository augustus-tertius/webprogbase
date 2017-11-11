const events = require('./modules/events.js');
const construcor = require('./modules/event.js');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const app = express();
let config = require('./config');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// let storage = multer.diskStorage({
//     destination: function(req, file, callback) {
//         callback(null, 'public/images/');
//     },
//     filename: function(req, file, callback) {
//         callback(null, construcor.generatePicId() + path.extname(file.originalname));
//     }
// });

let upload = multer({dest: 'public/images/' });

app.get('/',
    (req,res) => res.render('index'));

app.get('/events',
    (req,res) => {
        events.getAll()
            .then(data => {
                event_list = data;
                res.render('events', {event_list});
            })
            .catch(data => {
                console.log("An error occured: ", data);
                res.sendStatus(500);
            });
    });

app.get('/add',
    (req, res) => res.render('add'));

app.get('/event/:guid([0-9a-f-]{24})',
    (req, res) => {
        let event_id = req.params.guid;
        events.getById(event_id)
            .then(event => {
                res.render('event', {event});
            })
            .catch(
                err => {
                    console.log(err);
                    res.sendStatus(404);
                });
    });

app.get('/search', (req, res) => {
    let found = [];
    if (!req.query)
        res.render('search', {found});
    events.getAll()
        .then(data => {
            event_list = data;
            for (let i of event_list) {
                if (i.name.indexOf(req.query.input) !== -1)
                    found.push(i);
            }
            res.render('search', {found});
        })
        .catch(data => {
            console.log("An error occurred: ", data);
            res.sendStatus(500);
        });
});

app.post('/add', upload.single('pic'), (req, res) => {
    console.log(req.file);
    events.create(construcor.Event(req.body.name, req.body.place, req.body.duration, req.body.date), '/images/' + req.file.filename)
        .catch(err => {console.log('An error while creating: ', err, "\n");});
    res.redirect('/events');
});

app.post('/event/delete/:guid([0-9a-f-]{24})',
    (req, res) => {
        console.log('trying to del', req.originalUrl);
        let event_id = req.params.guid;
        events.remove(event_id)
            .then(() => {
                res.redirect('/events');
            })
            .catch(
                err => {
                    console.log(err);
                    res.sendStatus(404);
                });
    });


let event_list;

let portNum = config.port;
app.listen(portNum, () => console.log(`Server started on port ${portNum}.`));

// app.listen(app.get('port'), function() {
//     console.log('Node app is running on port', app.get('port'));
// });