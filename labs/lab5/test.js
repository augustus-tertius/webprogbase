const events = require('./modules/events.js');

events.getAll()
    .then(data => console.log(data))
    .catch(err => console.log(err));
