chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {


    switch (obj.cmd) {
        case "getInputFeilds":
            sendResponse(getInputFeilds());
            break;
        case "showMessage":

            showAlert();
            sendResponse('added');
            break;
        case "hideAlert":

            hideAlert();
            sendResponse('hidden');
            break;
        default:
            alert("Sending default")
            sendResponse(null);
    }
});


function showAlert() {



    var obj = document.createElement('div');
    obj.id = "nofishnotification"
    obj.style.cssText = "display: block;z-index: 1000000000; height: 100%;width:100%;position: fixed; top:0; left:0; background-color: rgba(242, 50, 36, 0.7);    border-radius: 10px;    transition: opacity 2s ease-out;";
    // obj.style.cssText = "display: block;z-index: 1000000000; height: 100px;width:400px;position: fixed; top: 10px; right: 10px; background-color: rgba(242, 50, 36, 0.7);    border-radius: 10px;    transition: opacity 2s ease-out;";

    var content = document.createElement('div');
    content.id = "nofishcontent"
    content.style.cssText = "display: flex; justify-content: center; align-items: center;  height: 100%;color: white;";

    var logo = document.createElement('pre');
    logo.id = "nofishlogo"
    logo.style.cssText = "font-size: 300px;";

    var span = document.createElement('span');
    span.id = "nofishlogospan"
    span.innerHTML = "&#9888;";

    var text = document.createElement('span');
    text.id = "nofishlogospan"
    text.style.cssText = "font-size: 48px;"
    text.innerHTML = "This site is phishing..!!!";

    logo.appendChild(span);
    content.appendChild(logo);
    content.appendChild(text);

    obj.appendChild(content);

    document.body.appendChild(obj);
    console.log('child appended')
}

function hideAlert() {
    if (document.getElementById("nofishnotification")) {
        document.getElementById("nofishnotification").remove();
    }


}

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

function takeScreenShot() {

}