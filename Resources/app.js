/*
 * TiWeather V0.1
 * Weather app for Appcelerator Titanium
 * =====================================
 * Coded By Jonathan Wheat 
 *  e: jonathan.wheat@codedog.net 
 *  w: http://codedog.net
 *  t: @jonthanpwheat
 * 
 * CREDITS / RECOGNITION
 * =====================
 * PNG Weather Images supplied by - http://www.youtoart.com/html/Icon/Other/4652.html 
 * Original weather concept pulled from : https://github.com/bob-sims/GWeather
 * 
 * Application Notes :
 * - The database is seeded with some weather, but that will be overwritten.
 * - The weather images supplied above, are off by 1 from what yahoo actually expects, so you'll see 
 *   parseInt(code) + 1 in there to get the correct png file
 * 
 */

//bootstrap and check dependencies
if (Ti.version < 1.8 ) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');	  	
}

// Determine the OS because we'll need this later
if(Titanium.Platform.osname==='android'){
    isAndroid=true;
} else {
	isAndroid=false;
}

// Register our database for storing offline (last) weather
Ti.Database.install('tiweather.sqlite', 'tiweather');

// Include our get weather library
Ti.include(	'/getWeather.js' );


// This is a single context application with mutliple windows in a stack
(function() {
	//determine platform and form factor and render approproate components
	var osname = Ti.Platform.osname,
		version = Ti.Platform.version,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth;
	
	//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
	//yourself what you consider a tablet form factor for android
	var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	
	var Window;
	if (isTablet) {
		Window = require('ui/tablet/ApplicationWindow');
	}
	else {
		// Android uses platform-specific properties to create windows.
		// All other platforms follow a similar UI pattern.
		if (osname === 'android') {
			Window = require('ui/handheld/android/ApplicationWindow');
		}
		else {
			Window = require('ui/handheld/ApplicationWindow');
		}
	}
	new Window().open();
})();
