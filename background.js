





const allBookMarks = [];

const showAlerts = (url, protocol) => {
  // alert(`You are about to navigate to ${url}`)
  //alert(`The protocol is ${protocol}`);
}


const checkPhishTank = (url) => {

  const data = {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "phishtank/cdaptest",
      "Accept": "*/*",
      "Cache-Control": "no-cache",
      "Postman-Token": "1d145364-0053-434c-9183-1c22dba6549e,82676691-b58a-4ef9-9b0c-1026af4c9aff",
      "Host": "checkurl.phishtank.com",
      "Accept-Encoding": "gzip, deflate",
      "Content-Length": "127",
      "Cookie": "__cfduid=d7935100ec331fc5fbf2902812ec698dd1594318865",
      "Connection": "keep-alive",
      "cache-control": "no-cache"
    },
    json: true,
    body: {
      url: url,
      format: 'json',
      app_key: '15b16e6c42c15f657a27c934af0c60aebec7bc5bd664a67e7efb7187ac43a411'
    },
  }

  fetch('https://checkurl.phishtank.com/checkurl/index.php', data)
    .then(res => {
      console.log('here');
      console.log(res.json());
    })

}


chrome.bookmarks.getTree((x) => {
  let bookmarkTypes = x[0].children;
  bookmarkTypes.map(type => {
    type.children.map(bb => {
      allBookMarks.push(bb.url);
    })
  })
})

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ color: '#3aa757' }, function () {
    console.log('The color is green.');
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({

      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.webNavigation.onBeforeNavigate.addListener(function (e) {
  if (e.url !== 'about:blank' && !(allBookMarks.indexOf(e.url) > -1)) {
    let protocol = e.url.split(":")[0];
    showAlerts(e.url, protocol);
    checkPhishTank(e.url)
  }
});


