const events = require('./modules/events.js');
const construcor = require('./modules/event.js');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'public/images/');
    },
    filename: function(req, file, callback) {
        callback(null, construcor.generatePicId() + path.extname(file.originalname));
    }
});

app.get('/',
    (req,res) => res.render('index'));

app.get('/events',
    (req,res) => {
        res.render('events', {event_list})
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
    let pageNum = 1;
    let pageSize = 2;
    let qu = "";
    let url = req.originalUrl;
    if (req.originalUrl.indexOf("&page=") !== -1) {
        pageNum = req.query.page;
        url = req.originalUrl.substring(0, req.originalUrl.indexOf("&page="));
    }
    let start = (pageNum - 1) * pageSize;
    let end = start + pageSize -1;
    let foundItems = -1;
    if (req.query.input) {
        qu = req.query.input;
        for (let i of event_list) {
            if (i.name.indexOf(req.query.input) !== -1) {
                foundItems++;
                if (foundItems >= start && foundItems <= end)
                    found.push(i);
            }
        }
    }
    foundItems += 1;
    let lastPage = Math.floor(foundItems / pageSize + foundItems % pageSize);
    res.render('search', {found, pageNum, lastPage, qu, url});
});

app.post('/add', (req, res) => {
    let upload = multer({ storage: storage}).single('userFile');
    let filepath = "";

    upload(req, res, function(err) {
        filepath = '/images/' + req.file.filename;
        res.end('File was uploaded');
        events.create(construcor.Event(req.body.name, req.body.place, req.body.duration, req.body.date, filepath))
            .catch(err => {console.log(err, "\n")});
    });
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
events.getAll()
    .then(data => {
        event_list = data;
    })
    .catch(data => {
        console.log("An error occured: ", data);
    });

let port_num = 3000;
app.listen(port_num, () => console.log(`Server started on port ${port_num}.`));