function hello() {

/*
 need to get the current tab document here
*/
    chrome.tabs.getCurrent(function (tab) {
        console.log(tab);
    });
}

document.getElementById('clickme').addEventListener('click', hello);