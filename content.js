function block_list_via_css(selectors) {
    if (!selectors.length)
        return;

    var css_chunk = document.createElement("style");
    css_chunk.type = "text/css";

    (document.head || document.documentElement).insertBefore(css_chunk, null);

    function fill_in_css_chunk() {
        if (!css_chunk.sheet) {
            window.setTimeout(fill_in_css_chunk, 0);
            return;
        }

        var GROUPSIZE = 1000;
        for (var i = 0; i < selectors.length; i += GROUPSIZE) {
            //
            var line = selectors.slice(i, i + GROUPSIZE);
            //console.log("line :"+line );
            var rule = line.join(",") + " { display:none !important; visibility: hidden !important; orphans: 4321 !important; }";
            css_chunk.sheet.insertRule(rule, 0);
        }
    }
    fill_in_css_chunk();
}
/*

var opts = { domain: document.location.hostname };


BGcall('get_content_script_data', opts, function(data) {

	console.log(data.selectors);
    block_list_via_css(data.selectors);


    onReady(function() {
    });

  });
*/
//var array = [];
var getData = function(request, sender, callback){
    if(request.action == "selectordata"){
        block_list_via_css(request.data);
    }
};

chrome.extension.onRequest.addListener(function(request, sender, callback){
    //getAllURLs();
    //console.log("Got the request");
    if(request.action == "selectordata"){
        block_list_via_css(request.data);
    }
});

function getAllURLs(callback){
    var array = [];
    var links = document.getElementsByTagName("a");
    for(var i=0, max=links.length; i<max; i++) {
        array.push(links[i].href);
    }
    //console.log(array);
    sendReq(array);
}

function sendReq(array){

    chrome.extension.sendRequest({host1 : 'sitelist' , value : array , function(response){

            //do Nothing Now
        }});
}


window.setTimeout(function(){
    getAllURLs();
} , 200);