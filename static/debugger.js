console.log('I am AQ debugger');
function test() {
    alert("I am debugger");

    if (!window.indexedDB) {
        console.log(`Your browser doesn't support IndexedDB`);
        return;
    }    
}
// IndexedDB control : https://dev.to/alexeagleson/how-to-use-indexeddb-to-store-data-for-your-web-application-in-the-browser-1o90 
var g_gcmId = ""; 
function getGcmId(db, version) {
  const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

  if (!indexedDB) {
    console.log("IndexedDB could not be found in this browser.");
    return;
  }

  // 2
  const request = indexedDB.open(db, version);

  // handler
  request.onerror = function (event) {
    console.error("An error occurred with IndexedDB");
    console.error(event);
  };
  request.onsuccess = function () {
    console.log("Database opened successfully");

    const db = request.result;

    // 1
    const transaction = db.transaction("web_push", "readwrite");

    //2
    const store = transaction.objectStore("web_push");

    //3 insert value
    // store.put({ id: 1, colour: "Red", make: "Toyota" });

    //4 get value
    const my_gcmId = store.get('gcmId');

    // 5
    my_gcmId.onsuccess = function () {
      console.log('gcmId', my_gcmId.result);
      g_gcmId = my_gcmId.result;
    };

    // 6
    transaction.oncomplete = function () {
      db.close();
    };
  };
};
getGcmId('aiqua',3,'web_push'); // fill g_gcmId

function sendWebPush(cid) { 
  // ex, sendWebPush(1345523)  // 1345523 : daniel's regular campaign 
  // ex, importing .js + wait 2 seconds + sendWebPush() in A SINGLE LINE:
  //    eval(await (await fetch('https://danjang-flask.herokuapp.com/debugger.js')).text());await new Promise(resolve => setTimeout(resolve, 2000));sendWebPush(1345523);
  if (cid == null || cid == "" || cid == 0 ) {
    console.log("Please call with a cid. Contact TS");
    return;
  }
  if (g_gcmId == "") {
    console.log("We have no gcmId");
    return;
  }
  if (QGSettings == null || QGSettings == "" || QGSettings.appId == null || QGSettings.appId == "") {
    console.log("We have no QGSettings.appId");
    return;
  }
  sendpush_uri = "https://danjang-flask.herokuapp.com/webpush/" + QGSettings.appId + "/" + cid + "/" + g_gcmId + "/" + window.location.hostname;
  console.log(sendpush_uri)  
  window.open(sendpush_uri, '_blank');
}

// final message to verify the importing succeeded
console.log('You can test web push message by running below in Chrome dev console');
console.log('sendWebPush( regular_campaign_id_you_can_get_from_AQ_dashboard )');

