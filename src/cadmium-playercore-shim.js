/* This script runs as a drop-in replacement of the original cadmium-playercore */
console.log("Hello, I am running instead of playercore");

var my_config = {
	"use_VP9": false,
	"use_5.1": true,
	"set_max_bitrate": true,
        "use_heaac-5.1": false,
}

function repr(obj) {
	// can you tell I'm a python programmer?
	return JSON.stringify(obj);
}

function do_patch(desc, needle, replacement) {
	var match = cadmium_src.match(needle);
	if (!match) {
		alert("Failed to find patch: " + repr(desc));
	} else {
		cadmium_src = cadmium_src.replace(needle, replacement);
		console.log("[+] Patched: " + repr(desc));
		if (match[0].length < 200) { // avoid spamming the console
			console.log(repr(match[0]) + " -> " + repr(replacement));
		}
	}
}

/* We need to do a synchronous request because we need to eval
the response before the body of this script finishes executing */
var request = new XMLHttpRequest();
var cadmium_url = document.getElementById("player-core-js").src;
request.open("GET", cadmium_url + "?no_filter", false); // synchronous
request.send(null);

var cadmium_src = request.responseText;

function get_profile_list() {
	 custom_profiles = [
			
                "playready-h264mpl30-dash",
		"playready-h264mpl31-dash",
		"playready-h264mpl40-dash",

                "h264mpl30-dash-playready-prk-qc",
	        "h264mpl31-dash-playready-prk-qc",
	        "h264mpl40-dash-playready-prk-qc",

		"hevc-main10-L30-dash-cenc",
		"hevc-main10-L31-dash-cenc",
		"hevc-main10-L40-dash-cenc",
		"hevc-main10-L50-dash-cenc",
		"hevc-main10-L51-dash-cenc",

		"hevc-main10-L30-dash-cenc-live",
		"hevc-main10-L31-dash-cenc-live",
		"hevc-main10-L40-dash-cenc-live",
		"hevc-main10-L41-dash-cenc-live",
		"hevc-main10-L50-dash-cenc-live",
		"hevc-main10-L51-dash-cenc-live",

		"hevc-main10-L30-dash-cenc-prk",
		"hevc-main10-L31-dash-cenc-prk",
		"hevc-main10-L40-dash-cenc-prk",
		"hevc-main10-L41-dash-cenc-prk",

		"hevc-main10-L30-dash-cenc-prk-do",
		"hevc-main10-L31-dash-cenc-prk-do",
		"hevc-main10-L40-dash-cenc-prk-do",
		"hevc-main10-L41-dash-cenc-prk-do",
		"hevc-main10-L50-dash-cenc-prk-do",
		"hevc-main10-L51-dash-cenc-prk-do",

                "hevc-hdr-main10-L30-dash-cenc-prk",
                "hevc-hdr-main10-L31-dash-cenc-prk",
                "hevc-hdr-main10-L40-dash-cenc-prk",
                "hevc-hdr-main10-L41-dash-cenc-prk",
                "hevc-hdr-main10-L50-dash-cenc-prk",
                "hevc-hdr-main10-L51-dash-cenc-prk",
                "hevc-hdr-main10-L30-dash-cenc-prk-do",
                "hevc-hdr-main10-L31-dash-cenc-prk-do",
                "hevc-hdr-main10-L40-dash-cenc-prk-do",
                "hevc-hdr-main10-L41-dash-cenc-prk-do",
                "hevc-hdr-main10-L50-dash-cenc-prk-do",
                "hevc-hdr-main10-L51-dash-cenc-prk-do",
                "hevc-hdr-main10-L30-dash-cenc-live",
                "hevc-hdr-main10-L31-dash-cenc-live",
                "hevc-hdr-main10-L40-dash-cenc-live",
                "hevc-hdr-main10-L41-dash-cenc-live",
                "hevc-hdr-main10-L50-dash-cenc-live",
                "hevc-hdr-main10-L51-dash-cenc-live",

		
		
		"ddplus-2.0-dash",
		

		"simplesdh",
		"nflx-cmisc",
		"BIF240",
		"BIF320"
	];

	if (my_config["use_VP9"]) {
		custom_profiles = custom_profiles.concat([
			"vp9-profile0-L30-dash-cenc",
			"vp9-profile0-L31-dash-cenc",
			"vp9-profile0-L40-dash-cenc",
		]);
	}

	if (my_config["use_5.1"]) {
		custom_profiles.push("ddplus-5.1-dash");
                //custom_profiles.push("heaac-5.1-dash");
		//custom_profiles.push("ddplus-5.1hq-dash");
		custom_profiles.push("ddplus-atmos-dash");
		
	}

	if (my_config["use_heaac-5.1"]) {
		custom_profiles.push("heaac-5.1-dash");
	}


	return custom_profiles;
}

do_patch(
	"Hello world",
	/(.*)/,
	"console.log('Hello, I am code which has been injected into playercore!'); $1"
);

do_patch(
	"Custom profiles",
	/(viewableId:.,profiles:).,/,
	"$1 get_profile_list(),"
);

do_patch(
	"Custom profile group",
	/(name:"default",profiles:)./,
	"$1 get_profile_list()"
);

do_patch(
	"Re-enable Ctrl+Shift+Alt+S menu",
	/this\...\....\s*\&\&\s*this\.toggle\(\);/,
	"this.toggle();");

// run our patched copy of playercore
eval(cadmium_src);



/* netflix_max_bitrate.js */

/* eslint-disable no-undef */
let getElementByXPath = function (xpath) {
	return document.evaluate(
		xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
	).singleNodeValue;
};

let fn = function () {
	const VIDEO_SELECT = getElementByXPath("//div[text()='Video Bitrate']") || getElementByXPath("//div[text()='Video Bitrate / VMAF']");
	const AUDIO_SELECT = getElementByXPath("//div[text()='Audio Bitrate']");
	const BUTTON = getElementByXPath("//button[text()='Override']");

	const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;
	if(!videoPlayer) {
		console.log("API Not Loading!");
		return false;
	}
	const player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0]);
	if(!player) {
		console.log("Video Not Loading!");
		return false;
	}
	if(!player.isPlaying()) {
		console.log("Video Not Playing!");
		return false;
	}

	window.dispatchEvent(new KeyboardEvent('keydown', {
		keyCode: 66,
		ctrlKey: true,
		altKey: true,
		shiftKey: true,
	}));

	if (!(VIDEO_SELECT && AUDIO_SELECT && BUTTON)){
		return false;
	}

	[VIDEO_SELECT, AUDIO_SELECT].forEach(function (el) {
		let parent = el.parentElement;

		let options = parent.querySelectorAll('select > option');

		for (var i = 0; i < options.length - 1; i++) {
			options[i].removeAttribute('selected');
		}

		options[options.length - 1].setAttribute('selected', 'selected');
	});

	console.log("Video Playing!");
	BUTTON.click();

	return true;
};

let run = function () {
	fn() || setTimeout(run, 100)	
};

const WATCH_REGEXP = /netflix.com\/watch\/.*/;

let oldLocation;

if (window.globalOptions === undefined) {
    try {
        window.globalOptions = JSON.parse(document.getElementById("netflix-intl-settings").innerText);
    } catch(e) {
        console.error("Could not load settings:", e);
    }
}
if(window.globalOptions.setMaxBitrate ) {
	console.log("netflix_max_bitrate.js enabled");
	//setInterval(test, 500);
	setInterval(function () {
		
		let newLocation = window.location.toString();

		if (newLocation !== oldLocation) {
			oldLocation = newLocation;
			WATCH_REGEXP.test(newLocation) && run();
		}
  }, 500);
}