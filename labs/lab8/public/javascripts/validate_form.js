function validate() {

    if (document.myForm.Name.value == "") {
        alert("Please provide your name!");
        document.myForm.Name.focus();
        return false;
    }

    if (document.myForm.EMail.value == "") {
        alert("Please provide your Email!");
        document.myForm.EMail.focus();
        return false;
    }
}

function validate_pass(pass) {
    let value = document.getElementById('pass_input').value;
    let error = document.getElementById('pass_to_short');
    console.log(pass.length);
    if (value.length < 4) {
        error.style.visibility = 'visible';
    } else {
        error.style.visibility = 'hidden';
    }
}