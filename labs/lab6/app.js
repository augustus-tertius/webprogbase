const events = require('./modules/events.js');
const users = require('./modules/user.js');
const construcor = require('./modules/event.js');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const app = express();
let config = require('./config');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let upload = multer({dest: 'public/images/' });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'SEGReT$25_',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

const serverSalt = "45%sAlT_";

function sha512(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
}

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
}, function (username, password, done) {
        let hash = sha512(password, serverSalt).passwordHash;
        console.log(username, password);
        users.getUserByLoginAndPasshash(username, hash)
            .then(user => {
                console.log(user);
                done(user ? null : 'No user', user);
            })
            .catch(err => {
                console.log(err);
            });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    console.log("deser");
    users.getUserById(id)
        .then(user => {
            done(user ? null : 'No user', user);
        })
        .catch(err => {
            console.log(err);
        });
});

function checkAuth(req, res, next) {
    if (!req.user) return res.sendStatus(401);
    next();
}

function checkAuthor(req, res, next) {
    events.getById(req.params.guid)
        .then(event => {
            if(req.params.guid !== req.user.id)
                res.sendStatus(401);
        })
        .catch(err => {
            res.sendStatus(500);
        });
    next();
}

function checkAdmin(req, res, next) {
    if (req.user.role !== 'admin')
        res.sendStatus(401);
    next();
}

app.get('/',
    (req,res) => res.render('index', {user: req.user}));

app.get('/sign_up',
    (req, res) => {
        res.render('signup', {user: req.user});
    });

app.post('/sign_up',
    (req, res) => {
        let user = {
            username: req.body.username,
            password: sha512(req.body.password, serverSalt).passwordHash,
            role: 'user'
        };
        users.create(user)
            .then (() => {
                res.redirect('/');
            })
            .catch(err => {
                console.log('could not create user:', err);
                res.redirect('/sign_up');
            });
    });

app.get('/login', (req, res) =>  {
    console.log('someone wants to log in.');
    res.render('login', {user: req.user});
});


app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

app.get('/logout',
    checkAuth,
    (req, res) => {
        req.logout();
        res.redirect('/');
    });

app.get('/events',
    checkAuth,
    (req,res) => {
        events.getAll(req.user.id)
            .then(data => {
                event_list = data;
                res.render('events', {event_list, user: req.user});
            })
            .catch(data => {
                console.log("An error occured: ", data);
                res.sendStatus(500);
            });
    });

app.get('/add',
    checkAuth,
    (req, res) => res.render('add', {user: req.user}));

app.get('/event/:guid([0-9a-f-]{24})',
    checkAuth,
    checkAuthor,
    (req, res) => {
        let event_id = req.params.guid;
        events.getById(event_id)
            .then(event => {
                res.render('event', {event, user: req.user});
            })
            .catch(
                err => {
                    console.log(err);
                    res.sendStatus(404);
                });
    });

app.get('/search',
    checkAuth,
    (req, res) => {
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
            res.render('search', {found, user: req.user});
        })
        .catch(data => {
            console.log("An error occurred: ", data);
            res.sendStatus(500);
        });
});

app.get('/everyone',
    checkAuth,
    checkAdmin,
    (req, res) => {
        let user_list = [];
        users.getAll()
            .then(data => {
                user_list = data;
                res.render('everyone', {user_list, user: req.user});
            })
            .catch(data => {
                console.log("An error occured: ", data);
                res.sendStatus(500);
            });
    });

app.post('/add', upload.single('pic'),
    checkAuth,
    (req, res) => {
    console.log(req.file);
    events.create(construcor.Event(req.body.name, req.body.place, req.body.duration, req.body.date),
        '/images/' + req.file.filename, req.user.id)
        .catch(err => {console.log('An error while creating: ', err, "\n");});
    res.redirect('/events');
});

app.post('/event/delete/:guid([0-9a-f-]{24})',
    checkAuth,
    checkAuthor,
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