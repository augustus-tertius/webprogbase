let filename = 'storage.json';
let fs = require('fs');

function create(x) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, (err, data) => {
            if (err)
                reject(err);
            else {
                let events = JSON.parse(data);
                events.push(x);
                fs.writeFile('./storage.json', JSON.stringify(events, null, 2), (err) => {
                    if(err)
                        reject(err);
                    else
                        resolve("\nSuccessfully created new event.\n");
                });
            }
        });
    });
}

function getAll() {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, (err, data) => {
            if (err)
                reject(err);
            else
                resolve(JSON.parse(data));
        })
    });
}

function getById(x_id) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, (err, data) => {
            if (err)
                reject(err);
            else {
                let events = JSON.parse(data);
                let found = events.find(item => {
                    return (item.id === x_id);
                });
                if (!found) reject('\nNo event with such id.\n');
                else resolve(found);
            }
        });
    });
}

function update(x) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, (err, data) => {
            if (err)
                reject(err);
            else {
                let events = JSON.parse(data);
                let foundIndex = events.findIndex(item => {
                    return (item.id === x.id);
                });
                if (foundIndex)
                    events[foundIndex] = x;
                else
                    reject("\nNo element with such id\n");

                fs.writeFile('./storage.json', JSON.stringify(events, null, 2), (err) => {
                    if(err)
                        reject(err);
                    else
                        resolve("\nSuccessfully updated the event.\n");
                });
            }
        });
    });
}

function remove(x_id) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, (err, data) => {
            if (err)
                reject(err);
            else {
                let events = JSON.parse(data);
                let foundIndex = events.findIndex(item => {
                    return (item.id === x_id);
                });
                events.splice(foundIndex);

                fs.writeFile('./storage.json', JSON.stringify(events, null, 2), (err) => {
                    if(err)
                        reject(err);
                    else
                        resolve("\nSuccessfully deleted the event.\n");
                });
            }
        });
    });
}


module.exports.create = create;
module.exports.getAll = getAll;
module.exports.getById = getById;
module.exports.update = update;
module.exports.remove = remove;
