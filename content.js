chrome.runtime.onMessage.addListener(function (cmd, sender, sendResponse) {

    switch (cmd) {
        case "getInputFeilds":           
            sendResponse(getInputFeilds());
            break;
        default:
            sendResponse(null);
    }
});


function getInputFeilds() {

    var inputs, index;

    inputs = document.getElementsByTagName('input');
    for (index = 0; index < inputs.length; index++) {
        var inp = inputs[index];
        if (inp.type === 'email' || inp.type === 'password') {
            inp.style.border = "2px solid red "
            inp.style.borderColor = 'red'
        }
    }
    return inputs;
}