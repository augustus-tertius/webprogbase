const events = require('./modules/events.js');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',
    (req,res) => res.render('index'));

app.get('/events',
    (req,res) => res.render('events', {event_list}));

app.get('/event/:guid([0-9a-f-]{24})',
    (req, res) => {
        console.log(req.originalUrl);
        //let pos =  ;//req.originalUrl.search(new RegExp('[0-9a-f-]{24}'));
        let event_id = req.params.guid //req.originalUrl.substr(pos);
        events.getById(event_id)
            .then(event => {
                res.render('event', {event});
            })
            .catch(
                err => {console.log(err);
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

app.listen(3000, () => console.log("Server started on port 3000."));