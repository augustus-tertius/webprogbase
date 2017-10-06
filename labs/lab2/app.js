let events = require("./events.js");

function askQuestion() {
    let info = "\nChoose operation code:\n" +
        "1 -- create new element(enter all fields)\n" +
        "2 -- get all elements from the storage\n" +
        "3 -- get element from storage by id(enter event id)\n" +
        "4 -- update element(enter all fields)\n" +
        "5 -- delete element from storage(enter event id)\n" +
        "enter -- close me.\n" +
        "for command to work enter it in format: \n" +
        "operation code | name | place | duration(in min.) | date | event_id(for update)\n" +
        "or: operation code | event_id\n";
    process.stdout.write(info);
}

function control(inputData) {
    switch (parseInt(inputData[0])) {
        case 1:
            return events.create(new Event(inputData[1], inputData[2], inputData[3], inputData[4]));
        case 2:
            return events.getAll();
        case 3:
            return events.getById(inputData[1].trim());
        case 4:
            return events.update(new Event(inputData[1], inputData[2], inputData[3], inputData[4], inputData[5].trim()));
        case 5:
            return events.remove(inputData[1].trim());
        default:
            console.log("wrong code at default\n");
    }
}

function prosessInput(inputData) {
    let code = parseInt(inputData[0], 10);
    if (code >= 1 && code <=5) {
        control(inputData)
            .then(data => {
                console.log(data);
                askQuestion();
            })
            .catch( () =>  {
                console.log("Error occurred, sorry.\n\n");
                askQuestion();
            });
    } else {
        process.stdout.write("Bad code, try again.\n");
    }
}

function onInput(buffer) {
    let inputString = buffer.toString().trim();
    console.log(`You've entered: '${inputString}'`);
    if (inputString) {
        prosessInput(inputString.split("|"));
    } else {
        console.log('Exiting.\n');
    }
}

function generateId() {
    let S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4());
}

function Event(name, place, duration, date, id) {
    if(id)
        this.id = id;
    else
        this.id = generateId();
    this.name = name;
    this.place = place;
    this.duration = duration;
    this.date = date;
}

askQuestion();
process.stdin.addListener('data', onInput);