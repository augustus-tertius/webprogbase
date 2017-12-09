let model = {
    events: [],
    filterString: "",

    get filteredUsers() {
        let filter = model.filterString.toLowerCase().trim();
        return !filter ? this.events : this.events.filter(x => x.name.toLowerCase().includes(filter));
    }
};

window.addEventListener('load', function() {
    let inputEl = document.getElementById('input');
    inputEl.addEventListener('input', function(e) {
        model.filterString = e.target.value;
        renderUsers();
    });
    inputEl.value = model.filterString;

    requestUsers();
});

function requestUsers() {
    let ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function() {
        console.log(ajax.readyState, ajax.response, ajax.status);
        if(ajax.readyState === 4 && ajax.status === 200) {
            let eventObj = JSON.parse(ajax.response);
            model.events = eventObj;
            console.log(eventObj, model.filterString);
            renderUsers();
        }
    };

    ajax.open('GET', '/api/v1/user/events');
    ajax.send();
}

function renderUsers() {
    let filteredUsers = model.filteredUsers;
    console.log(filteredUsers);

    let template = document.getElementById("my-list-template").innerHTML;
    // згенерувати HTML строку на основі шаблону і даних
    let renderedHTML = Mustache.render(template, { list: filteredUsers });
    // помістити строку з HTML всередину елемента з ідентифікатором "my-list"
    document.getElementById("res_events").innerHTML = renderedHTML;
}