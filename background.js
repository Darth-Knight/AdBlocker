allFilters = null;
webRTCPrivacy = null;
flag = false;
var map = {};
var HOUR_IN_MS = 1000 * 60 * 60;
var whitelist = new Set();
var blocklistSet = new Set();
var tempSet = new Set();
thirdPartyFilters = [];
selectorFilters = [];
generalFilters = [];
adFilters = {};
privacyFilters = {};
var url_array = [];
whitelistObject = {};
domainWhitelist = [];
blockingEnabled = false;
adFilters.domainFilters = {};
var tabDataStore = {};


//------------------------------------------------------------------------------------------------------------------------------------------------------------------------



function getUrlTextAsync(url,filename,callback){
    readURLAsync(url , function(value){
        if(value !== "timeout"){
            callback(value.responseText);
        }
        else{
            readURLAsync(filename , function(value){
                callback(value.responseText);
            });
        }
    });
}



function checkForBlocking(urlDomain, filters, thirdPartytracker){

    for(var i = 0 ; filters.generalFilters!== undefined && i < filters.generalFilters.length ; i++){
        var temp = filters.generalFilters[i];
        if(urlDomain.indexOf(temp) > -1){
            if(thirdPartytracker)              console.log("Adblocker      "+urlDomain +"      "+ temp);
            else                          console.log("privacyblocker   "+urlDomain +"      "+ temp);
            return temp;
        }
    }

    for(var i = 0 ;filters.domainFilters !== undefined && i < filters.domainFilters.length ; i++){
        var temp = filters.domainFilters[i];
        if(urlDomain.indexOf(temp) > -1){
            if(thirdPartytracker)              console.log("Adblocker      "+urlDomain +"      "+ temp);
            else                          console.log("privacyblocker   "+urlDomain +"      "+ temp);
            return temp;
        }
    }


    for(var i = 0 ;filters.thirdPartyFilters !== undefined && i < filters.thirdPartyFilters.length ; i++){
        var temp = filters.thirdPartyFilters[i];
        if(thirdPartytracker){
            if(urlDomain.indexOf(temp) > -1 ){
                console.log("Adblocker      "+urlDomain +"      "+ temp);
                return temp;
            }
        }else{
            if(urlDomain.indexOf(temp) > -1 && getLocation(urlDomain).hostname == temp){
                console.log("Privacyblocker      "+urlDomain +"      "+ temp);
                return temp;
            }
        }
    }

    return "-1";
}

var getLocation = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};


chrome.storage.local.get('privacyFilters' ,
    function(result){
        var key = 'last_subscriptions_check';
        var now = Date.now();
        var delta = now - (storage_get(key) || now);
        var delta_hours = delta / HOUR_IN_MS;
        if(result['privacyFilters'] == undefined || delta_hours > 72){
            getUrlTextAsync('https://easylist-downloads.adblockplus.org/easyprivacy.txt','easyprivacy.txt',function(value){
                privacyFilters = getAllParsers(value);
                console.log(privacyFilters);
                chrome.storage.local.set({'privacyFilters' : privacyFilters});
            });
        }
        else{
            privacyFilters = result['privacyFilters'];
        }

    });

chrome.storage.local.get('adFilters' ,
	function(result){
	    var key = 'last_subscriptions_check';
	    var now = Date.now();
	      var delta = now - (storage_get(key) || now);
	      var delta_hours = delta / HOUR_IN_MS;

	      // Automatically update the list in 3 days
	      if(result['adFilters'] == undefined || delta_hours > 72){
	        getUrlTextAsync('https://easylist.to/easylist/easylist.txt','easylist.txt',function(value){
	          adFilters = getAllParsers(value);
                for(var i = 0 ; i < defaultFilters.length ; i++){
                    adFilters.domainFilters.push(defaultFilters[i]);
                }
	           console.log(adFilters);
	          chrome.storage.local.set({'adFilters' : adFilters});              // have to figure out a way to save it to with async call
	        });
	      }
	      else{
	        adFilters = result['adFilters'];
	      }

		enable();
  });
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function onBeforeRequestHandler(details) {


    // check if blocking is enabled or not
    if(!blockingEnabled)
        return{cancel:false};
    var blocked =false;                               // flag for deciding if blocked or not

    var blockedAdResult = checkForBlocking(details.url, adFilters, true);
    var blockedTrackerResult = checkForBlocking(details.url , privacyFilters, false);


    if(blockedAdResult !== "-1"){
        tabDataStore[details.tabId].adarray.push(details.url);
        tabDataStore[details.tabId].total += 1;
        // updateBadge(tabId);
        blocked = true;
    }
    if(blockedTrackerResult !== "-1"){
        tabDataStore[details.tabId].privacyArray.push(details.url);
        tabDataStore[details.tabId].total += 1;
        // updateBadge(tabId);
        blocked = true;
    }
    return { cancel: blocked };

}


//------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Create data store
// Create listeners
chrome.tabs.onCreated.addListener(function (tab) {
    tabDataStore[tab.id] = {
        adarray : [],
        privacyArray : [],
        total : 0
    };
});

chrome.webNavigation.onBeforeNavigate.addListener(function callback(details){

    console.log("complete");
    if(details.frameId==0){
        console.log("inside");
        tabDataStore[details.tabId] = {
            adarray : [],
            privacyArray : [],
            total : 0
        };}
});

chrome.tabs.onRemoved.addListener(function (tabId) {
    delete tabDataStore[ tabId];
});

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Enable the adblocker
function enable(icon = true) {
	if (blockingEnabled) {
		return;
	}
	chrome.webRequest.onBeforeRequest.addListener(onBeforeRequestHandler, {urls: ["http://*/*", "https://*/*"]}, ["blocking"]);
    chrome.tabs.onUpdated.addListener(CSSListener);

	blockingEnabled = true;
	if (icon) {
		chrome.browserAction.setIcon({
			path : "enabled.png"
		});
	}
}

// disable the ad blocker
function disable(icon = true) {
    blockingEnabled = false;
    chrome.tabs.onUpdated.removeListener(CSSListener);
    chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestHandler);
    if (icon) {
        chrome.browserAction.setIcon({
            path : "disabled.png"
        });
    }
}

function getStatus(){
    if(blockingEnabled){
        return true;
    }
    return false;
}


//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function CSSListener(tabId, changeInfo, tab){
    if(blockingEnabled){
        chrome.tabs.sendRequest(tabId , {
            'action' : 'selectordata',
            'data' : adFilters.cssFilters
        });
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------

