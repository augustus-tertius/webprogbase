let fs = require('fs');
let http = require('http-request');

function askQuestion() {
    process.stdout.write('Input city name: ');
}

function processInput(buffer) {
    let inputString = buffer.toString().trim();
    console.log(`Entered city: '${inputString}'`);
    if (inputString) {
        fs.readFile(inputString + '.txt', 'utf8', function (err, contents){
            if(!err)
                console.log("\n"+ "info about " + inputString + " " +
                    "was read \n" + contents);
            else {
                console.log("\nan error occured while trying to read file.");
                http.get('https://api.teleport.org/api/cities/?search=' + inputString, function (err, res) {
                    if (err) {
                        console.error('\nerror while getting info from web');
                        return;
                    }
                    console.log(res.buffer.toString());
                });
            }
        });
        askQuestion();
    } else {
        // exit
        console.log(`Exit.`);
        process.stdin.end();
    }
}

process.stdin.addListener('data', processInput);

askQuestion();
