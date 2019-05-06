var tab = null;
var elem = null;
var address = [];
var address1 = [];
var adress2 = [];
var current ;
var isPageWhiteListed ;

var BG = chrome.extension.getBackgroundPage();
//
// var intialBlocking = BG.getStatus();
// if(!intialBlocking){
// 	document.getElementById("btnListen").innerHTML = "UnPause";
// }
// BG.getCurrenTabInfo(function(info){
	// tab = info.tab;
	// isPageWhiteListed = BG.isWhiteListed(tab.url);
	//
	// if(isPageWhiteListed){
	// 	document.getElementById("WhitelistThis").innerHTML = "UnWhitelist Site";
	// }


	// var page_count = info.tab_blocked || "0";
	// tempAddress = info.tab_ad_array;
	// address2 = info.harmful_urls;
	// var tempSet = new Set();
	// if(tempAddress !== undefined){
	// 	for(var i = 0 ; i < tempAddress.length ; i++){
	// 		//BG.console.log(tempAddress[i]);
	// 		tempSet.add(tempAddress[i]);
	// 	}
	//
	//
	// 	for(var i of tempSet){
	// 		address.push(i);
	// 	}
	// }
	//
	// tempSet.clear();
	// tempAddress = info.tab_privacy_array;
	// //BG.console.log("tab_privacy_array : "+info.tab_privacy_array);
	// if(tempAddress !== undefined){
	// 	for(var i = 0 ; i < tempAddress.length ; i++){
	// 		//BG.console.log(tempAddress[i]);
	// 		tempSet.add(tempAddress[i]);
	// 	}
	// 	for(var i of tempSet){
	// 		address1.push(i);
	// 	}
	// }
	//
	//
	// if(info.tab_blocked == undefined || info.tab_blocked == 0){
	// 	document.getElementById("current_page_counter").innerHTML = "0";
	// }
	// else{
	// 	document.getElementById("current_page_counter").innerHTML = info.tab_blocked || "0";
	// }
	// if(info.total_blocked == undefined || info.total_blocked == 0){
	// 	document.getElementById("all_page_count").innerHTML = info.total_blocked;
	// }
	// else{
	// 	document.getElementById("all_page_count").innerHTML = info.total_blocked;
	//}


// });
//
//
// document.addEventListener('DOMContentLoaded',function(){
// 	document.getElementById("openNew").addEventListener("click",opentab);
// 	document.getElementById("WhitelistThis").addEventListener("click",function(){
//
// 		var isWhite = BG.isWhiteListed(tab.url);
// 		//BG.console.log("isWhite : "+isWhite);
// 		if(isWhite){
// 			//
// 		document.getElementById("WhitelistThis").innerHTML = "Whitelist Site";
// 			BG.removeWhiteList(tab.url);
// 			chrome.tabs.reload();
// 		}
// 		else{
// 		document.getElementById("WhitelistThis").innerHTML = "UnWhitelist Site";
// 			BG.addWhiteList(tab.url);
// 			BG.console.log("WhiteList URL "+tab.url);
// 			chrome.tabs.reload();
// 		}
// 		window.close()
// 		//refreshPopup();
//
// 	});


	document.getElementById("btnListen").addEventListener("click",function(){

		elem = document.getElementById("btnListen");
		BG.console.log(elem.value);
		var checkBlocking = BG.getStatus();
		if(checkBlocking){
			BG.disable();
			document.getElementById("btnListen").innerHTML = "UnPause";
			chrome.tabs.reload();

		}
		else{
			BG.enable();
			document.getElementById("btnListen").innerHTML = "Pause";
			chrome.tabs.reload();

		}
		window.close();
		//refreshPopup();
	});

// 	document.getElementById("advanced").addEventListener("click",function(){
//
//
// 		var x = document.getElementById("myDIV");
// 		BG.console.log(isWhiteListed);
// 		if(isPageWhiteListed){
// 			x.style.display = "none";
// 			document.getElementById("parent_div").style.width = "150px";
// 		}
// 		else{
// 								    BG.console.log(x.style.display);
// 								    if(x.style.display == ""){
// 								    	document.getElementById("parent_div").style.width = "150px";
// 								    }
// 								    else if (x.style.display === "block") {
//
// 									}
//
// 		}
// 		//refreshPopup();
// 	});
//
// 	document.getElementById("adlist").addEventListener("click",function(){
//
//
// 		var x = document.getElementById("myDIV");
// 		BG.console.log(isPageWhiteListed);
// 		if(isPageWhiteListed){
// 			x.style.display = "none";
// 			document.getElementById("parent_div").style.width = "150px";
// 		}
// 		else{
// 								    BG.console.log(x.style.display);
// 								    if(x.style.display == ""){
// 								    	x.style.display = "block";
// 								    	document.getElementById("parent_div").style.width = "400px";
// 								  		displayAddress1();
// 								    }
// 								    else if (x.style.display === "none") {
// 								        x.style.display = "block";
// 								        document.getElementById("parent_div").style.width = "400px";
// 								  		displayAddress1();
// 								    } else if(current == "adlist") {
// 								        x.style.display = "none";
// 								        document.getElementById("parent_div").style.width = "150px";
// 									}
// 									else{
// 										document.getElementById("parent_div").style.width = "400px";
// 								  		displayAddress1();
// 									}
//
//
// 									/*
// 									address[0]="fghjk";
// 									address[1]="fvhjbn";
// 									address[2]="56ygvbn";
// 									address[3]="gfds";*/
//
// 								function displayAddress1(){
// 									document.getElementById("block_text").style.display = 'block';
// 									document.getElementById("block_text").innerHTML ="Domains of Blocked Ads are: "+ address.length;
// 								    var result = document.getElementById("result");
// 								    current= "adlist";
// 								    result.innerHTML="";
//
// 								    var display = [];
// 								    var addrno = [];
// 								     for(var i=0; i<address.length; i++)
// 								    {
// 								        display[i] = address[i];
// 								        addrno[i] = i+1;
// 								        result.innerHTML += addrno[i]+"            "+display[i]+"<br>";
// 								    }
// 								}
// 			}
// 			//refreshPopup();
// 						});
//
//
// 						document.getElementById("trackerlist").addEventListener("click",function(){
//
//
// 							var x = document.getElementById("myDIV");
// 							BG.console.log(isPageWhiteListed);
// 							if(isPageWhiteListed){
// 								x.style.display = "none";
// 								document.getElementById("parent_div").style.width = "150px";
// 							}
// 							else{
// 								    BG.console.log(x.style.display);
// 								    if(x.style.display == ""){
// 								    	x.style.display = "block";
// 								    	document.getElementById("parent_div").style.width = "400px";
// 								  		displayAddress2();
// 								    }
// 								    else if (x.style.display === "none") {
// 								        x.style.display = "block";
// 								        document.getElementById("parent_div").style.width = "400px";
// 								  		displayAddress2();
// 								    } else if(current == "trackerlist") {
// 								        x.style.display = "none";
// 								        document.getElementById("parent_div").style.width = "150px";
// 									}
// 									else{
// 										document.getElementById("parent_div").style.width = "400px";
// 								  		displayAddress2();
// 									}
//
//
// 								function displayAddress2(){
// 									document.getElementById("block_text").style.display = 'block';
// 									document.getElementById("block_text").innerHTML ="Domains of Blocked Trackers are: "+ address1.length;
// 								    var result = document.getElementById("result");
// 								    current = "trackerlist";
// 								    result.innerHTML="";
//
// 								    var display = [];
// 								    var addrno = [];
// 								     for(var i=0; i<address1.length; i++)
// 								    {
// 								        display[i] = address1[i];
// 								        addrno[i] = i+1;
// 								        result.innerHTML += addrno[i]+"            "+display[i]+"<br>";
// 								    }
// 								}
// 							}
// 							//refreshPopup();
// 						});
//
// 						document.getElementById("list").addEventListener("click",function(){
//
//
// 							var x = document.getElementById("myDIV");
// 							BG.console.log(isPageWhiteListed);
// 							if(isPageWhiteListed){
// 								x.style.display = "none";
// 								document.getElementById("parent_div").style.width = "150px";
// 							}
// 							else{
// 								    BG.console.log(x.style.display);
// 								    if(x.style.display == ""){
// 								    	x.style.display = "block";
// 								    	document.getElementById("parent_div").style.width = "400px";
// 								  		displayAddress3();
// 								    }
// 								    else if (x.style.display === "none") {
// 								        x.style.display = "block";
// 								        document.getElementById("parent_div").style.width = "400px";
// 								  		displayAddress3();
// 								    } else if(current == "list"){
// 								        x.style.display = "none";
// 								        document.getElementById("parent_div").style.width = "150px";
// 									}
// 									else{
// 										document.getElementById("parent_div").style.width = "400px";
// 								  		displayAddress3();
// 									}
//
// 								function displayAddress3(){
// 									document.getElementById("block_text").style.display = 'block';
// 									document.getElementById("block_text").innerHTML ="Unsafe URLs are: "+ address2.length;
// 								    var result = document.getElementById("result");
// 								    current = "list";
// 								    result.innerHTML="";
//
// 								    var display = [];
// 								    var addrno = [];
// 								     for(var i=0; i<address2.length; i++)
// 								    {
// 								        display[i] = address2[i];
// 								        addrno[i] = i+1;
// 								        result.innerHTML += addrno[i]+"            "+display[i]+"<br>";
// 								    }
// 								}
// 							}
// 							//refreshPopup();
// 						});
//
//
//
//
//
// });

function opentab(){
	console.log("Here");
	chrome.tabs.create({url: "options.html"});
}

function refreshPopup(){
  window.location.href="popup.html";
}