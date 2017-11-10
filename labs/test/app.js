const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/lab5';

// const url = 'mongodb://admin:admin@ds145275.mlab.com:45275/mighty-lowlands';

mongoose.connect(url);

let Event = mongoose.model('Event', {
    name: String,
    place: String,
    duration: Number,
    date: String,
    picturePath: String
}, 'events');

let nEv = new Event ({
    name: "Some other test",
    place: "no place, it's for test",
    duration: 80,
    date: "2017-10-16T08:30:00Z",
    picturePath: "/images/jogging.jpeg"
});

nEv.save()
    .then(x => console.log("Created: %s", x))
    .catch(err => console.log(err));

console.log('Ok');

