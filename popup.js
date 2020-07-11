let currentURL = '';
let whoIsObj = null;

requestInfoFromBackgroundScript()


document.getElementById("inputBoxes").addEventListener("click", myFunction);
document.getElementById("reportBlacklist").addEventListener("click", reportToBlacklist);



document.addEventListener('DOMContentLoaded', function () {
    chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.query({ active: true, windowId: currentWindow.id }, function (activeTabs) {
            // inject content_script to current tab
            chrome.tabs.executeScript(activeTabs[0].id, { file: 'content.js', allFrames: false });
        });
    });
});

function myFunction() {
    checkCurrentTab();
}

function reportToBlacklist() {

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        currentURL = tabs[0].url;


        fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_UP7NPAziy3B474nFwmWuCHrf8lp1m&domainName=${currentURL}&outputFormat=JSON`)
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

function checkCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        var url = tabs[0].url;
        chrome.tabs.sendMessage(tabs[0].id, "getInputFeilds", null, function (obj) {
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
        fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_UP7NPAziy3B474nFwmWuCHrf8lp1m&domainName=${currentURL}&outputFormat=JSON`)
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
    fetch(`https://endpoint.apivoid.com/domainbl/v1/pay-as-you-go/?key=aa7116fb1bd407a9fe692d5fec7cd1a43dcac259&host=${host}`)
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
    console.log(dataObj)
    const countryCode = dataObj.dns.data.report.server.country_code
    document.getElementById('country').src = `https://www.countryflags.io/${countryCode}/flat/64.png`;
    document.getElementById('hostname').innerHTML = dataObj.whois.WhoisRecord.domainName;
    document.getElementById('ipaddress').innerHTML = dataObj.dns.data.report.server.ip;
    document.getElementById('created').innerHTML = dataObj.whois.WhoisRecord.createdDateNormalized ? dataObj.whois.WhoisRecord.createdDateNormalized : 'Unknown'
    document.getElementById('expired').innerHTML = dataObj.whois.WhoisRecord.expiresDateNormalized ? dataObj.whois.WhoisRecord.expiresDateNormalized : 'Unknown';
    document.getElementById('hostname').innerHTML = dataObj.whois.WhoisRecord.domainName;
    document.getElementById('country-name').innerHTML = dataObj.dns.data.report.server.country_name;


}



