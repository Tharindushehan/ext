





const allBookMarks = [];

const showAlerts = (url, protocol) => {
  // alert(`You are about to navigate to ${url}`)
  //alert(`The protocol is ${protocol}`);
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
    
  }
});


