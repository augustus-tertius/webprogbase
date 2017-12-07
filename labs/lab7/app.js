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
const basicAuth = require('basic-auth');
let config = require('./config');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/jq', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

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
        users.getUserByLoginAndPasshash(username, hash)
            .then(user => {
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
            if(event.authorId !== req.user.id)
                res.sendStatus(401);
        })
        .catch(() => {
            res.sendStatus(500);
        });
    next();
}

function checkAdmin(req, res, next) {
    if (req.user.role !== 'admin')
        res.sendStatus(401);
    next();
}

function basic_auth(req, res, next) {
    let n_user = basicAuth(req);
    if (n_user && n_user.name && n_user.pass) {
        let hash = sha512(n_user.pass, serverSalt).passwordHash;
        users.getUserByLoginAndPasshash(n_user.name, hash)
            .then (res_user => {
                req.user = res_user;
                next();
            })
            .catch (() => {
                next();
            });
    } else {
        next();
    }
}

function apiCheckAuthor(req, res, next) {
    if (!req.user) {
        next();
    }
    events.getById(req.params.guid)
        .then(event => {
            if(event.authorId !== req.user.id)
            {
                let resp = {
                    code: 401,
                    message: "you are not authorised to view this page"
                };
                res.send(JSON.stringify(resp, null, 4));
            } else {
                next();
            }
        })
        .catch((err) => {
            console.log(err);
            let resp = {
                code: 500,
                message: "an error occurred"
            };
            res.send(JSON.stringify(resp, null, 4));
        });
    // next();
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


app.get('/api/v1/',
    (req, res) => {
    let d = "localhost:3000";
    let resp = {
        user_data: d + "/api/v1/user",
        user_events: d + "/api/v1/user/events"
    };
    res.send(JSON.stringify(resp, null, 4));
});

app.get('/api/v1/user', basic_auth,
    async (req, res) => {
        if (req.user) {
            let count = await events.countAll(req.user.id);
            let resp = {
                username: req.user.username,
                events_quan: count
            };
            res.send(JSON.stringify(resp, null, 4));
        } else {
            let resp = {
                message: "auth required to access this page"
            };
            res.send(JSON.stringify(resp, null, 4));
        }
});

app.get('/api/v1/user/events', basic_auth,
    async (req, res) => {
        if (req.user) {
            let found = await events.getAll(req.user.id);
            let resp = [];
            let q = (req.query.name) ? (req.query.name) : "";
            for (let i of found) {
                if (i.name.indexOf(q) !== -1) {
                    let info = {
                        id: i.id,
                        name: i.name,
                        date: i.date,
                        info: "/api/v1/user/event/" + i.id
                    };
                    resp.push(info);
                }
            }
            res.send(JSON.stringify(resp, null, 4));
        } else {
            let resp = {
                message: "auth required to access this page"
            };
            res.send(JSON.stringify(resp, null, 4));
        }
    });

app.get('/api/v1/user/event/:guid([0-9a-f-]{24})', basic_auth, apiCheckAuthor,
    async (req, res) => {
        if (req.user) {
            let found = await events.getById(req.params.guid);
            let resp = {
                id: found.id,
                name: found.name,
                place: found.place,
                date: found.date,
                duration: found.duration,
                pic: "/api/v1" + found.picture
            };
            res.send(JSON.stringify(resp, null, 4));
        } else {
            let resp = {
                message: "auth required to access this page"
            };
            res.send(JSON.stringify(resp, null, 4));
        }
    });


app.get('/api/v1/images/:picid([0-9a-z]{32})',
    async (req, res) => {
        let options = {
            root: __dirname + '/public/images/',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true,
            }
        };

        let filename = req.params.picid;
        res.header("Content-Type", "image");
        res.sendFile(filename, options, function (err) {
            if (err) {
                console.log(err);
            }
        });
    });

let event_list;

let portNum = config.port;
app.listen(portNum, () => console.log(`Server started on port ${portNum}.`));