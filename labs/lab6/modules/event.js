function generateId() {
    let S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4());
}

function generatePicId() {
    let S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4() + S4() + S4() + S4() + S4());
}

function Event(name, place, duration, date, picpath, id) {
    if(id)
        this.id = id;
    else
        this.id = generateId();
    this.name = name;
    this.place = place;
    this.duration = duration;
    this.date = date;
    this.picturePath = picpath;
    return (this);
}

module.exports.Event = Event;
module.exports.generatePicId = generatePicId;