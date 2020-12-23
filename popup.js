// Firebase
var firebaseConfig = {
    apiKey: "AIzaSyCrQa3Dh7b0cJQMH8NmOFe_SUarUUP8c3c",
    authDomain: "cdap-sliit.firebaseapp.com",
    databaseURL: "https://cdap-sliit.firebaseio.com",
    projectId: "cdap-sliit",
    storageBucket: "cdap-sliit.appspot.com",
    messagingSenderId: "632221563651",
    appId: "1:632221563651:web:e2fc72ff4958f1c1304736",
    measurementId: "G-Q0XRC78G0W"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


let currentURL = '';
let whoIsObj = null;

requestInfoFromBackgroundScript()
checkNetwork();

document.getElementById("inputBoxes").addEventListener("click", myFunction);
document.getElementById("reportBlacklist").addEventListener("click", reportToBlacklist);
document.getElementById("reportWhitelist").addEventListener("click", reportToWhitelist);
document.getElementById("more-details").addEventListener("click", navigateToMoreInfo);
document.getElementById("seemorebtn").addEventListener("click", seeMoreButtonOnClick);
document.getElementById("screen-shot").addEventListener("click", takeScreenshot);
document.getElementById("check-url").addEventListener("click", checkUrl);


document.addEventListener('DOMContentLoaded', function() {
    chrome.windows.getCurrent(function(currentWindow) {
        chrome.tabs.query({ active: true, windowId: currentWindow.id }, function(activeTabs) {
            // inject content_script to current tab
            chrome.tabs.executeScript(activeTabs[0].id, { file: 'content.js', allFrames: false });
        });
    });
});

function myFunction() {
    checkCurrentTab();
}

function navigateToMoreInfo() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        currentURL = tabs[0].url;

        fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_UP7NPAziy3B474nFwmWuCHrf8lp1m&domainName=${currentURL}&outputFormat=JSON`)
            .then(response => response.json())
            .then(data => {
                let host = data.WhoisRecord.domainName;
                chrome.tabs.create({
                    url: `http://localhost:3000/websiteDetails/${host}`,
                    active: true
                })
            })
            .catch(error => console.error(error));

    });
}

function reportToBlacklist() {

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        currentURL = tabs[0].url;


        fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_hEO0I17JhbTCiC6y7YRYt9IW62l24&domainName=${currentURL}&outputFormat=JSON`)
            .then(response => response.json())
            .then(data => {
                let host = data.WhoisRecord.domainName;
                fetch("http://localhost:5000/api/blacklist", {
                        method: "POST",
                        body: JSON.stringify({
                            url: host
                        }),
                        headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }
                    })
                    .then(response => response.json())
                    .then(json => alert('Reported to blacklist'));
            })
            .catch(error => console.error(error));



    });



}

function reportToWhitelist() {

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        currentURL = tabs[0].url;


        fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_hEO0I17JhbTCiC6y7YRYt9IW62l24&domainName=${currentURL}&outputFormat=JSON`)
            .then(response => response.json())
            .then(data => {
                let host = data.WhoisRecord.domainName;
                fetch("http://localhost:5000/api/whitelsit", {
                        method: "POST",
                        body: JSON.stringify({
                            url: host
                        }),
                        headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }
                    })
                    .then(response => response.json())
                    .then(json => alert('Reported to whitelist'));
            })
            .catch(error => console.error(error));



    });



}

function checkCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        var url = tabs[0].url;
        chrome.tabs.sendMessage(tabs[0].id, "getInputFeilds", null, function(obj) {
            console.log("getHeadTitle.from content_script:", obj);
        });
    });

}








if (whoIsObj) {
    console.log(whoIsObj.WhoisRecord.administrativeContact.city)
        // document.getElementById('city').innerHTML=
}

function requestInfoFromBackgroundScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        currentURL = tabs[0].url;
        // console.log(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_hEO0I17JhbTCiC6y7YRYt9IW62l24&domainName=${currentURL}&outputFormat=JSON`);
        fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_hEO0I17JhbTCiC6y7YRYt9IW62l24&domainName=${currentURL}&outputFormat=JSON`)
            .then(response => response.json())
            .then(data => {
                whoIsObj = data;
                getIpData(whoIsObj)
            })
            .catch(error => console.error(error));
    });
}

function getIpData(whoIsObj) {
    const host = whoIsObj.WhoisRecord.domainName;
    fetch(`https://endpoint.apivoid.com/domainbl/v1/pay-as-you-go/?key=d58abc5be3bed02ea9c36833c7b2be60c4f01872&host=${host}`)
        .then(response => response.json())
        .then(data => {
            let dataObj = {
                whois: whoIsObj,
                dns: data
            }
            printData(dataObj);
        })
        .catch(error => console.error(error))
}


function printData(dataObj) {

    const countryCode = dataObj.dns.data.report.server.country_code
    document.getElementById('country').src = `https://www.countryflags.io/${countryCode}/flat/64.png`;
    document.getElementById('hostname').innerHTML = dataObj.whois.WhoisRecord.domainName;
    document.getElementById('ipaddress').innerHTML = dataObj.dns.data.report.server.ip;
    document.getElementById('created').innerHTML = dataObj.whois.WhoisRecord.createdDateNormalized ? dataObj.whois.WhoisRecord.createdDateNormalized : 'Unknown'
    document.getElementById('expired').innerHTML = dataObj.whois.WhoisRecord.expiresDateNormalized ? dataObj.whois.WhoisRecord.expiresDateNormalized : 'Unknown';
    document.getElementById('hostname').innerHTML = dataObj.whois.WhoisRecord.domainName;
    document.getElementById('country-name').innerHTML = dataObj.dns.data.report.server.country_name;

    document.getElementById('extension').style.display = "block";
    document.getElementById('loading').style.display = "none";

}

function checkNetwork() {

    // var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    // var type = connection.type;

    console.log(navigator.connection)


}


function takeScreenshot() {
    chrome.tabs.captureVisibleTab(null, {}, function(image) {
        uploadImage(image);
        // var a = document.createElement("a"); //Create <a>
        // a.href = image; //Image Base64 Goes here
        // a.download = "Image.jpeg"; //File name Here
        // a.click(); //Downloaded file
    });
}

function uploadImage(fileString) {

    var file = dataURLtoFile(fileString, 'hello.jpeg');
    const ref = firebase.storage().ref();
    const name = new Date() + '_' + file.name;
    const metadate = {
        ContentType: file.type
    }

    const task = ref.child(name).put(file, metadate);
    task
        .then(snapshot => {
            snapshot.ref.getDownloadURL()
                .then(url => {
                    console.log(url)
                }).catch(err => {
                    console.log(err);
                })
        }).catch(err => {
            console.log(err);
        })

}

function dataURLtoFile(dataurl, filename) {

    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}

var getLocation = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};
async function checkUrl() {
    chrome.tabs.query({ active: true, currentWindow: true }, async(tabs) => {
        currentURL = tabs[0].url;
        var l = getLocation(currentURL).hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0]

        const rawResponse = await fetch('http://mainapi.alwaysdata.net/api/searchUrl', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: l })
        });
        const content = await rawResponse.json();
        if (content.whiteList == false) {
            alert("Danger Danger !!!!!")
        }

    });
}


function seeMoreButtonOnClick() {
    let buttonText = document.getElementById("seemorebtn").innerHTML;
    if (buttonText === 'See More Options') {
        document.getElementById('moreinfo').style.display = "block";
        document.getElementById("seemorebtn").innerHTML = "See Less";
    } else {
        document.getElementById('moreinfo').style.display = "none";
        document.getElementById("seemorebtn").innerHTML = "See More Options";
    }
}