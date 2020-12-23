const showAlerts = () => {


    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {


        setTimeout(function() {
            chrome.tabs.sendMessage(tabs[0].id, { cmd: "showMessage" }, function(obj) {
                // console.log('Show Alert', obj);
            });
        }, 1000)
        setTimeout(function() {
            chrome.tabs.sendMessage(tabs[0].id, { cmd: "hideAlert" }, function(obj) {
                // console.log('Hide Alert', obj);
            });
        }, 5000);
    });


}





chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({ color: '#3aa757' }, function() {
        console.log('The color is green.');
    });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({

            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.webNavigation.onBeforeNavigate.addListener(function(e) {



    IsLegitimateUrl(e.url).then(x => {

        if (!x) {
            showAlerts();
        }
    });




});

const nodeServer = "http://localhost:5000";




function IsLegitimateUrl(url) {

    return new Promise(async function(resolve, reject) {
        if (url === 'about:blank') {;
            resolve(true);
        }

        if (isNetworkTrusted(url) || isDnsTrusted()) {

            // if (isProtocolHtp(url)) {
            //     console.log("Protocolissue", url)
            //     return true;
            // } else {

            let bookmarkAvailable = await isUrlBookMarked(url);
            if (bookmarkAvailable) {
                resolve(true);
                // return true;
            } else {
                if (isUrlWhitelisted(url)) {
                    resolve(true);
                } else {

                    let x = await isUrlBLacklisted(url);
                    console.log(x);
                    if (x) {
                        resolve(false);

                    } else {

                        if (isCertificateValid(url)) {
                            // alert("certificate valid");
                            resolve(true);
                        } else {
                            if (isUrlLengthValid()) {
                                if (isUrlContainsSymbols(url)) {
                                    // alert("validissue issue");
                                    resolve(false);
                                } else {
                                    if (isUrlDetectedFishingFromML(url)) {
                                        // alert("ML issue");
                                        resolve(false);
                                    } else {
                                        resolve(true);
                                    }
                                }
                            } else {
                                // alert("urlissue")
                                resolve(false);
                            }
                        }

                    }
                }
                // }
            }
        } else {
            // alert("legitimate issue");
            resolve(false);
        }
    })




}

function isDnsTrusted() {
    return true
}

function isNetworkTrusted() {
    return true;
}

// function isProtocolHtp(url) {
//     let protocol = url.split(':')[0];
//     return protocol === "http"
// }


function loadBookmarks() {
    return new Promise((resolve, reject) => {
        const allBookMarks = []
        chrome.bookmarks.getTree((x) => {
            let bookmarkTypes = x[0].children;
            bookmarkTypes.map(type => {
                type.children.map(bb => {
                    allBookMarks.push(bb.url);
                })
            })
            resolve(allBookMarks);
        })
    })
}

async function isUrlBookMarked(url) {

    let data = await loadBookmarks();
    console.log(data.indexOf(url));
    return data.indexOf(url) > -1;



}

function isUrlWhitelisted(url) {
    return false;
}

async function isUrlBLacklisted(url) {

    const hostName = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];

    let data = await (await fetch(`${nodeServer}/api/blacklist`)).json();
    data = data.list;

    for (let key in data) {
        let u = data[key]
        if (hostName.includes(u.hostname)) {

            return true;
        }
    }
    return false;

    // for (let i = 0; i < data.leangth; i++) {
    //     let u = data[i];
    //     // alert(JSON.stringify(u))
    //     console.log('hostname', hostName)
    //     if (u.hostname === hostName) {
    //         alert(u.hostname + ' ' + hostName)
    //         return true;
    //     }
    // }

    // fetch(`${nodeServer}/api/blacklist`)
    //     .then(response => response.json())
    //     .then(data => {

    //         const hostName = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
    //         for (let i = 0; i < data.leangth; i++) {
    //             let u = data[i];
    //             // alert(JSON.stringify(u))

    //             if (u.hostname === hostName) {
    //                 alert(u.hostname + ' ' + hostName)
    //                 return true;
    //             }
    //         }

    //         return false;
    //     })
    //     .catch(error => {
    //         console.error(error)
    //         return false
    //     })

}

function isUrlLengthValid(url) {
    return url.length < 54
}

function isUrlContainsSymbols(url) {
    return url.contains('@');
}

function isUrlDetectedFishingFromML(url) {
    return false;
}

function isDomHasInputFields() {
    return false;
}

function isComputerVisionDetected() {
    return false;
}

async function isCertificateValid(url) {

    const host = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
    const rawResponse = await fetch(`https://endpoint.apivoid.com/sslinfo/v1/pay-as-you-go/?key=5ab4596249cc01c62bcb20c919d138872c50a02a&host=${host}`, {
        method: 'GET'
    });
    const content = await rawResponse.json();
    // alert(JSON.stringify(content.data.certificate))

    if (content.data) {
        let isCertificateBlacklisted = content.data.certificate ? content.data.certificate.blacklisted : false;
        let isCertificateDeprecated = content.data.certificate ? content.data.certificate.deprecated_issuer : false
        let isCertificateExpired = content.data.certificate ? content.data.certificate.expired : false;
        let isCertificateValid = content.data.certificate ? content.data.certificate.valid : true

        return !(isCertificateBlacklisted | isCertificateExpired | isCertificateDeprecated | !isCertificateValid)
    } else {
        return true;
    }

}