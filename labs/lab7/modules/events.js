const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/labs';
mongoose.connect(url);

let Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let eventSch = new Schema({
    name: String,
    place: String,
    duration: Number,
    date: String,
    picture: String,
    authorId: String
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

function create(x, pic, aId) {
    return new Promise(function (resolve, reject) {
        let newEvent = new Event ({
            name: x.name,
            place: x.place,
            duration: x.duration,
            date: x.date,
            picture: pic,
            authorId: aId
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

function getAll(authorId) {
    return new Promise(function (resolve, reject) {
        Event.find({authorId: authorId}, function (err, docs) {
            if (err)
                reject(err);
            resolve(JSON.parse(JSON.stringify(docs)));
        });
    });
}

function countAll(authorId) {
    return new Promise(function (resolve, reject) {
        Event.find({authorId: authorId}, function (err, docs) {
            if (err)
                reject(err);
            resolve(JSON.parse(JSON.stringify(docs)).length);
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

function searchByName(q, page, perPage, author_id) {
    let search_param = ".*" + q + '.*';
    let auth = author_id;

    return new Promise(((resolve, reject) => {
        Event
            .find({name: new RegExp(search_param), authorId: auth})
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .exec(function(err, docs) {
                if (err)
                    reject(err);
                else
                    resolve(JSON.parse(JSON.stringify(docs)));
            });
    }));
}

function countByName(q, author_id) {
    let search_param = ".*" + q + '.*';
    let auth = author_id;

    return new Promise(((resolve, reject) => {
        Event
            .find({name: new RegExp(search_param), author_id: auth})
            .count()
            .exec(function(err, res) {
                if (err)
                    reject(err);
                else
                    resolve(res);
            });
    }));
}

function update(x) {
    return new Promise(function (resolve, reject) {
        Event.findById(x.id, function (err, event){
            if (err)
                reject(err);
            if (!event)
                reject('no event wiht such id');
            // resolve(JSON.parse(JSON.stringify(event)));
            event.name = x.name;
            event.place = x.place;
            event.duration = x.duration;
            event.date = x.date;
            // event.picture = x.picture;
            event.save();
            resolve('updated event');
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
module.exports.update = update;
module.exports.getAll = getAll;
module.exports.countAll = countAll;
module.exports.getById = getById;
module.exports.remove = remove;
module.exports.searchByName = searchByName;
module.exports.countByName = countByName;
