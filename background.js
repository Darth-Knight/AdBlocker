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

// For setting the values of the keys from reading the text file

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
//For checking which requests to block

function checkForBlocking(urlDomain, filters, thirdPartytracker){

    for(var i = 0 ; filters.generalFilters!== undefined && i < filters.generalFilters.length ; i++){
        var temp = filters.generalFilters[i];
        if(urlDomain.indexOf(temp) > -1){
            return temp;
        }
    }

    for(var i = 0 ;filters.domainFilters !== undefined && i < filters.domainFilters.length ; i++){
        var temp = filters.domainFilters[i];
        if(urlDomain.indexOf(temp) > -1){
            return temp;
        }
    }


    for(var i = 0 ;filters.thirdPartyFilters !== undefined && i < filters.thirdPartyFilters.length ; i++){
        var temp = filters.thirdPartyFilters[i];
        if(thirdPartytracker){
            if(urlDomain.indexOf(temp) > -1 ){
                return temp;
            }
        }else{
            if(urlDomain.indexOf(temp) > -1 && getLocation(urlDomain).hostname == temp){
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

function onBeforeRequestHandler(details) {
    // check if blocking is enabled or not
    if(!blockingEnabled || tabDataStore[details.tabId] === undefined || ( details.url.indexOf("googleusercontent.com")>-1) )
        return{cancel:false};
    var blocked =false;                               // flag for deciding if blocked or not

    if(tabDataStore[details.tabId].url !== undefined && isWhiteListed(tabDataStore[details.tabId].url)  ){
        console.log("return");
        return{cancel:false};
    }

    var blockedAdResult = checkForBlocking(details.url, adFilters, true);
    var blockedTrackerResult = checkForBlocking(details.url , privacyFilters, false);


    if(blockedAdResult !== "-1"){
        tabDataStore[details.tabId].adarray.push(details.url);
        tabDataStore[details.tabId].total += 1;
        updateBadge(details.tabId);
        blocked = true;
    }
    if(blockedTrackerResult !== "-1"){
        tabDataStore[details.tabId].privacyArray.push(details.url);
        tabDataStore[details.tabId].total += 1;
        updateBadge(details.tabId);
        blocked = true;
    }
    return { cancel: blocked };

}


//------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Create data store
// Create listeners
chrome.tabs.onCreated.addListener(function (tab) {
    tabDataStore[tab.id] = {
        url : tab.url,
        adarray : [],
        privacyArray : [],
        total : 0
    };
});

chrome.webNavigation.onBeforeNavigate.addListener(function (details){
    // console.log("complete");

    if(details.frameId==0){
        // console.log("inside");
        tabDataStore[details.tabId] = {
            url : details.url,
            adarray : [],
            privacyArray : [],
            total : 0
        };
    }
});

chrome.tabs.onRemoved.addListener(function (tabId) {
    delete tabDataStore[tabId];
});

chrome.tabs.onUpdated.addListener(CSSListener);
chrome.webRequest.onBeforeRequest.addListener(onBeforeRequestHandler, {urls: ["http://*/*", "https://*/*"]}, ["blocking"]);

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Enable the adblocker
function enable(icon = true) {

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
    // tabDataStore = [];
    // chrome.tabs.onUpdated.removeListener(CSSListener);
    // chrome.webRequest.onBeforeRequest.removeListener();
    // chrome.webNavigation.onBeforeNavigate.removeListener(tabdata);
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
// For passing the list of css filters to content script

function CSSListener(tabId, changeInfo, tab){
    if(blockingEnabled && !isWhiteListed(tab.url)){
        chrome.tabs.sendRequest(tabId , {
            'action' : 'selectordata',
            'data' : adFilters.cssFilters
        });
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//Setting the count on the extension logo

function setBadge(options){
    chrome.browserAction.setIcon({tabId : options.tabId , path : options.iconsPaths} , function(){
        if (chrome.runtime.lastError) {
            return;
        }
        chrome.browserAction.setBadgeText({text : options.text , tabId : options.tabId});
        chrome.browserAction.setBadgeBackgroundColor({color : options.color});
    });

}

function updateBadge(tabId){
    var options = {};
    options.tabId = tabId;
    options.color = "#555";

    var ad_count = tabDataStore[tabId].privacyArray.length + tabDataStore[tabId].adarray.length;

    options.text = ad_count.toString();
    if(options.text  == "0"){
        options.text  ="";
    }
    options.iconsPaths = {'19' : 'enabled.png' };
    setBadge(options);
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//For whitelisting the urls

function addWhiteList(url) {
    var url = url.replace(/#.*$/, '');
    url = getLocation(url).hostname ;

    var temp1 = localStorage.getItem("whiteListObject");
    if(temp1 !== "" && temp1 !== null){
        whitelistObject = JSON.parse(temp1);
    }

    whitelistObject[url] = url;
    localStorage.setItem("whiteListObject",JSON.stringify(whitelistObject));
}

function isWhiteListed(url  ){
    var url = url.replace(/#.*$/, '');

    url = getLocation(url).hostname ;
    var temp1 = localStorage.getItem("whiteListObject");
    if(temp1 !== "" && temp1 !== null){
        whitelistObject = JSON.parse(temp1);
    }
    if(whitelistObject[url] !== undefined){
        return true;
    }
    return false;
}

function removeWhiteList(url) {
    var url = url.replace(/#.*$/, '');
    //whitelist.delete(url);
    url = getLocation(url).hostname;

    var temp1 = localStorage.getItem("whiteListObject");
    if (temp1 !== "" && temp1 !== null) {
        whitelistObject = JSON.parse(temp1);
    }
    delete whitelistObject[url];
    localStorage.setItem("whiteListObject", JSON.stringify(whitelistObject));
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function getCookies(url, callback) {
    var cookiesArray1 = [];
    chrome.cookies.getAll({"url":url.protocol + "//" + url.hostname}, function (cookies) {
            cookies.forEach(function(cookie) {
                cookiesArray1.push({
                    name: cookie.name,
                    domain: cookie.domain,
                    secure: cookie.secure,
                });
            });
            callback(cookiesArray1);
        }
    );


}

function getCurrentTabInfo(callback){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){

        if(tabs.length == 0 || tabDataStore[tabs[0].id] === undefined){
            // callback();
            return;
        }
        var tab = tabs[0];
        var tabId=tab.id;
        var adMap = new Map();
        for(var i = 0 ;tabDataStore[tabId].adarray.length !== undefined && i <tabDataStore[tabId].adarray.length ; i++){
            if(adMap.get(tabDataStore[tabId].adarray[i]))
                adMap.get(tabDataStore[tabId].adarray[i]).val++;
            else
                adMap.set(tabDataStore[tabId].adarray[i],{val : 1});
        }

        var trackerMap = new Map();
        for(var i = 0 ;tabDataStore[tabId].privacyArray.length !== undefined &&  i <tabDataStore[tabId].privacyArray.length ; i++){
            if(trackerMap.get(tabDataStore[tabId].privacyArray[i]))
                trackerMap.get(tabDataStore[tabId].privacyArray[i]).val++;
            else
                trackerMap.set(tabDataStore[tabId].privacyArray[i],{val : 1});
        }

        var ad_count = tabDataStore[tabId].privacyArray.length + tabDataStore[tabId].adarray.length;
        var secure_url = true;
        if(tab.url.indexOf("https://") === -1) secure_url=false;
        var cookiesArray = [];

        var url = document.createElement('a');
        url.setAttribute('href',tab.url);
        getCookies(url,function (cookiesArray1) {
            cookiesArray = cookiesArray1;

            var total_blocked = ad_count;
            var tab_ad_array = adMap;
            var tab_privacy_array = trackerMap;

            var result = {
                tab:tab,
                total_blocked:total_blocked,
                tab_ad_array : tab_ad_array,
                tab_privacy_array : tab_privacy_array,
                secure_url : secure_url,
                cookiesArray : cookiesArray,
                whitelisted : isWhiteListed(tab.url),
                blockingStatus : blockingEnabled
            };

            callback(result);
        });
    });
}