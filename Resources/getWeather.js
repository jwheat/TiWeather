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
 */

// structire our timestamp
var d = new Date();
var currentTS = parseInt(((d.getTime()) / 1000),10);

// zipcode of the place we want the weather for
var wxLocation = '17019';
var xhrURL = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D'http%3A%2F%2Fxml.weather.yahoo.com%2Fforecastrss%2F"+wxLocation+"_f.xml'&format=json";

// set up the last updated timestamp
var lastUpdatedTS = Titanium.App.Properties.getInt('lastUpdatedTS');
if (lastUpdatedTS == null || lastUpdatedTS < 1347355555) {
	lastUpdatedTS = 1347355555;  // set default to old date, we'll update the first time the app is run
	Ti.App.Properties.setInt('lastUpdatedTS', 1347355555 );
}

// check to see if we need to update the weather
if (checkNeedsUpdating(currentTS,lastUpdatedTS) && (Titanium.Network.networkType != Titanium.Network.NETWORK_NONE)) {
	runUpdate(xhrURL,currentTS);
}	

busy = true;
// pause to display the update box
setTimeout(checkBusy, 3000);

busy=false;

function runUpdate(remoteURL,nowTS) {
		showModalWindow();
		updateDatabaseFromRemote(remoteURL,nowTS);
		setTimeout(checkBusy, 5000);
}

function updateDatabaseFromRemote(remoteURL,nowTS) {
	max_timestamp = '';
	
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onload = function() {
		try {
			// parse the JSON feed
			var jsonObject = JSON.parse(this.responseText);

			if (jsonObject.query.results.item.title != '') {
				// access the heading section of the feed.
				var created = jsonObject.query.created;
				var item = jsonObject.query.results.item;
				var title = item.title;
				var lat = item.lat;
				var lon = item.long;
				var status = "current";
				// access the current conditions section
				var code = item.condition.code;
				var cdate = item.condition.date;
				var day = "CUR";  // today so we'll leave it empty
				var temp = item.condition.temp;  // using 'temp'
				var high = ""; 
				var low =  ""; 
				var text = item.condition.text;
				
				// save these values in teh database
				saveRecord (created,status,code,cdate,day,temp,high,low,text,title,lat,lon,nowTS);
				
				// access the forecast section of the feed now
				var current = jsonObject.query.results.item;
				var forecast = current.forecast;
				

				for (var i = 0; i < forecast.length; i++) {
					code = forecast[i].code;
					cdate = forecast[i].date;
					day = forecast[i].day;
					high = forecast[i].high;
					low = forecast[i].low;
					text = forecast[i].text;
					status = "forecast";
					
					Ti.API.info( "Add : " + day + " " + nowTS);
					
					saveRecord (created,status,code,cdate,day,temp,high,low,text,title,lat,lon,nowTS);
				}
				// remove the old records where lastudpated != nowTS
				removeOldRecords(nowTS);
			}
			busy=false;		
		}
		catch(e) {
			Ti.API.error("Caught: " + e)
			busy=false;
		}

	};
	xhr.onerror = function(e) {
		busy=false;
	};
	// open the client and get the data
	Titanium.App.Properties.setInt('lastUpdatedTS',nowTS);

	xhr.setTimeout(25000);
	Ti.API.info("Open: "+remoteURL);
	xhr.open('GET',remoteURL);
	xhr.setRequestHeader('User-Agent','Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Version/3.0 Mobile/1A537a Safari/419.3');
	xhr.send(); 
};


function saveRecord (created,status,code,cdate,day,temp,high,low,text,title,lat,lon,lastupdated) {
	var db = Titanium.Database.open('tiweather');
	db.execute('INSERT INTO latest_weather (created,status,code,date,day,temp,high,low,text,title,lat,long,lastupdated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',created,status,code,cdate,day,temp,high,low,text,title,lat,lon,lastupdated);
	Ti.API.info("added weather record for : " + day + " - " + code);
	db.close();
}

function removeOldRecords(nowTS) {
	var db = Titanium.Database.open('tiweather');
	var sql = "delete from latest_weather where lastupdated < '" + nowTS + "'";
	db.execute(sql);
	db.close();
	Ti.API.info ("delete SQL : " + sql);
}

function showModalWindow() {
	updateWin = Titanium.UI.createWindow({
		backgroundColor:'#440000',
		borderWidth:4,
		borderColor:'#282828',
		height:140,
		width:200,
		borderRadius:8,
		opacity:0.92
	});
	var label1 = Ti.UI.createLabel({
		text:'Checking for Update,',
		top:35,
		width:'auto',
		height:'auto',
		textAlign:'center',
		color:'#ffffff',
		font:{fontWeight:'bold',fontSize:18}
	});
	updateWin.add(label1);
	var label2 = Ti.UI.createLabel({
		text:'please wait...',
		top:60,
		width:'auto',
		height:'auto',
		textAlign:'center',
		color:'#ffffff',
		font:{fontWeight:'bold',fontSize:18}
	});
	updateWin.add(label2);
	var actInd = Titanium.UI.createActivityIndicator({
		top:90, 
		height:16,
		width:16,
		left:92,
		style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
	});
	actInd.show();
	updateWin.add(actInd);
	updateWin.open();
}


function checkBusy() {
	if (busy) {
		setTimeout(checkBusy, 5000);
	} else {
		closeModalWindow();	
	}
};

function closeModalWindow() {
	var t2 = Titanium.UI.create2DMatrix();
	t2 = t2.scale(0);
	updateWin.close({transform:t2,duration:300});
	updateWin.close();
}

function checkNeedsUpdating(nowTS, lastTime) {
	var retval = false;
	//var lastUpdatedTS = lastTime
	var timeDiff = nowTS - lastTime;
	// check every 15 minutes
	var delay = 900; //900 = 15 minutes
	if (timeDiff > delay ) {
		retval = true;
		Ti.API.info("DB needs updating from remote");
		//Ti.API.info("NOW " + nowTS);
		//Ti.API.info("LAST" + lastTime);
		//Ti.API.info("DIFF" + timeDiff);
		//Ti.App.Properties.setInt('attendees_lastUpdatedTS', nowTS );
		//closeModalWindow();	
		
	} else {
		Ti.API.info("DB does not need updating");
		//Ti.API.info("NOW " + nowTS);
		//Ti.API.info("LAST" + lastTime);
		//Ti.API.info("DIFF" + timeDiff);	
		//Ti.App.Properties.setInt('attendees_lastUpdatedTS', nowTS );	
		//closeModalWindow();
	}
	return retval;
};
