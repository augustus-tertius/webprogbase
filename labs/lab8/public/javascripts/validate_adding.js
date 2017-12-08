function validate() {
    if (document.getElementById('event_name').value.length > 50) {
        return false;
    } else if (document.getElementById('event_place').value.length > 50) {
        return false;
    } else if (document.getElementById('event_duration').value < 0) {
        return false;
    } else {
        return true;
    }
}

function validate_name(name) {
    let value = document.getElementById('event_name').value;
    let error = document.getElementById('name_too_long');
    if (value.length > 50) {
        error.style.visibility = 'visible';
    } else {
        error.style.visibility = 'hidden';
    }
}

function validate_place(place) {
    let value = document.getElementById('event_place').value;
    let error = document.getElementById('place_too_long');
    if (value.length > 50) {
        error.style.visibility = 'visible';
    } else {
        error.style.visibility = 'hidden';
    }
}

function validate_duration(duration) {
    let value = document.getElementById('event_duration').value;
    let error = document.getElementById('duration_invalid');
    if (value < 0) {
        error.style.visibility = 'visible';
    } else {
        error.style.visibility = 'hidden';
    }
}