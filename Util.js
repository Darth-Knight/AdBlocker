defaultFilters = [
    ".doubleclick.net",
    "partner.googleadservices.com",
    ".googlesyndication.com",
    ".google-analytics.com",
    "creative.ak.fbcdn.net",
    ".adbrite.com",
    ".exponential.com",
    ".quantserve.com",
    ".scorecardresearch.com",
    ".zedo.com",
]

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
storage_get = function(key) {
    var store =localStorage;
    var json = store.getItem(key);
    if (json == null)
        return undefined;
    try {
        return JSON.parse(json);
    } catch (e) {
        log("Couldn't parse json for " + key);
        return undefined;
    }
};

storage_set = function(key, value) {
    var store = localStorage;
    if (value === undefined) {
        store.removeItem(key);
        return;
    }
    try {
        store.setItem(key, JSON.stringify(value));
    } catch (ex) {
        if (ex.name == "QUOTA_EXCEEDED_ERR" && !SAFARI) {
            alert(translate("storage_quota_exceeded"));
            openTab("options/index.html#ui-tabs-2");
        }
    }
};

function createMapOfArray(map,array){
    for(var i = 0 ;array.length !== undefined && i <array.length ; i++){
        var key = getLocation(array[i]).hostname;
        if(map.get(key))
            map.set(key, map.get(key)+1);
        else
            map.set(key, 1);
    }
}

var getLocation = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------


//REading thhe list from the file
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function readURLAsync(url , callback){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.timeout = 2000;
    xhr.ontimeout = function () {

        console.error("The request for " + url + " timed out.");
        callback("timeout");
    };
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                //console.log(xhr.responseText);
                callback(xhr);
            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };
    xhr.send(null);
}
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Parsing the different regexes
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function getAllParsers(text){
    var adFilters = {};

    var i = 0;
    var value = text.split('\n');
    var filter1 = [];
    var filter2 = [];
    var filter3 = [];
    var filter4 = [];

    for(var i = 0 ; i < value.length ; i++){
        var str = value[i];
        var re_dom = new RegExp('^[|]{2}.*\\^$');
        var re_third = new RegExp('^[|]{2}.*\\$third-party$');
        var re_css = new RegExp('^[##]+\\..*');

        if(re_dom.test(str)){
            str = str.replace('||','');
            str = str.replace('^','');
            var reip = new RegExp('\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b');

            if (reip.test(str)) {
                continue;
            }
            else{
                var pattern = new RegExp('^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$');
                if(pattern.test(str)){
                    filter1.push(str);
                }
            }
        }
        if(re_third.test(str)){
            str = str.replace('||','');
            str = str.replace('^$third-party','');
            var reip = new RegExp('\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b');
            if (reip.test(str)) {
                continue;
            }
            else{
                var pattern = new RegExp('^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$');
                if(pattern.test(str)){
                    filter2.push(str);
                }
            }
        }
        if(str[0] == '#' && str[1] == '#' && str[2] == '#' ){
            str =  str.substring(2);
            filter3.push(str);
        }
        else if(re_css.test(str) ){
            str = str.substring(2);
            filter3.push(str);
        }
        else if(/^youtube.com##/.test(str)){
            str = str.substring(13);
            filter3.push(str);
        }
        if(str[0] == '|' && str[1] == '|'){
            str = str.substring(2);
            filter4.push(str);
        }
        else if(str[0] == '/' || str[0] == '&' || str[0] == '-' || str[0] == '.' || str[0] == '='){
            filter4.push(str);
        }
    }

    adFilters.domainFilters = filter1;
    adFilters.thirdPartyFilters = filter2;
    adFilters.cssFilters = filter3;
    adFilters.generalFilters = filter4;

    return adFilters;
}
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
