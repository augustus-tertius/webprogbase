const mongoose = require('mongoose');
// const url = 'mongodb://localhost:27017/labs';
const url = 'mongodb://admin:admin@ds145275.mlab.com:45275/mighty-lowlands';
mongoose.connect(url);

let Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let eventSch = new Schema({
    name: String,
    place: String,
    duration: Number,
    date: String,
    picture: String
});

eventSch.options.toJSON = {
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

let Event = mongoose.model('Event', eventSch, 'events');

function create(x, pic) {
    return new Promise(function (resolve, reject) {
        let newEvent = new Event ({
            name: x.name,
            place: x.place,
            duration: x.duration,
            date: x.date,
            picture: pic
        });

        newEvent.save()
            .then(() => {
                resolve("successfuly created new event");
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getAll() {
    return new Promise(function (resolve, reject) {
        Event.find({}, function (err, docs) {
            if (err)
                reject(err);
            resolve(JSON.parse(JSON.stringify(docs)));
        });
    });
}

function getById(x_id) {
    return new Promise(function (resolve, reject) {
        Event.findById(x_id, function (err, event){
            if (err)
                reject(err);
            if (!event)
                reject('no event wiht such id');
            resolve(JSON.parse(JSON.stringify(event)));
        } );
    });
}

function remove(x_id) {
    return new Promise(function (resolve, reject) {
        Event.findById(x_id, function (err, event) {
            if (err)
                reject(err);
            if (!event)
                reject('no event wiht such id');
            event.remove();
            resolve("event deleted");
        } );
    });
}


module.exports.create = create;
module.exports.getAll = getAll;
module.exports.getById = getById;
module.exports.remove = remove;
