function validate() {
    let value = document.getElementById('pass_input').value;
    if (value.length < 4) {
        return false;
    }
}

function validate_pass(pass) {
    let value = document.getElementById('pass_input').value;
    let error = document.getElementById('pass_to_short');
    if (value.length < 4) {
        error.style.visibility = 'visible';
    } else {
        error.style.visibility = 'hidden';
    }
}