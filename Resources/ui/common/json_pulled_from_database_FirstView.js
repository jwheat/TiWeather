/*
 * TiWeather V0.2
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


function FirstView() {
	//create object instance, a parasitic subclass of Observable
	var self = Ti.UI.createView();
		
	// open database
	var db = Titanium.Database.open('tiweather');
		
	// get records for current conditions -
	status = "current";
	var sql = "select created,status,code,date,day,temp,high,low,text,title,lat,long,lastupdated from latest_weather where status = '" + status + "'";
	var dbrow = db.execute(sql);
	
	while (dbrow.isValidRow())
	{
		var created = dbrow.fieldByName('created');
		var status = dbrow.fieldByName('status');
		var code = dbrow.fieldByName('code');
		code = parseInt(code) + 1;
		var cdate = dbrow.fieldByName('date');
		var day = dbrow.fieldByName('day');
		var temp = dbrow.fieldByName('temp');
		var high = dbrow.fieldByName('high');
		var low = dbrow.fieldByName('low');
		var text = dbrow.fieldByName('text');
		var title = dbrow.fieldByName('title');
		var lat = dbrow.fieldByName('lat');
		var lon = dbrow.fieldByName('long');
		var lastupdated = dbrow.fieldByName('lastupdated');
		dbrow.next();
	}	
	dbrow.close();
	
	// create the table array
	var data = [];
					
	// Parse Time/Date to what we want
	// "pubDate":"Fri, 30 Nov 2012 10:55 am EST",
	// timestamp : 10:55 am EST
	// date      : Fri, 30 Nov 2012
	
	var wx_time_array = cdate.split(" ");
	var wx_timestamp = wx_time_array[4] + wx_time_array[5] + " " + wx_time_array[6];
	var wx_date = wx_time_array[0] + " " + wx_time_array[1] + wx_time_array[2] + wx_time_array[3] 
	
	// Parse Title to what we want
	// "title":"Conditions for Dillsburg, PA at 10:55 am EST"
	// city  : Conditions for Dillsburg
	// state : PA
	var wx_title_array = title.split(",");
	var wx_state_array = wx_title_array[1].split(" ");
	var title_state = wx_state_array[1];
	var title_city = wx_title_array[0].replace("Conditions for ", "");
			
	var headerRow = Ti.UI.createTableViewRow({
		title:'Local Weather',
		font:{fontSize:22,fontWeight:'bold'},
		backgroundImage:'/images/bgblue.png',
		backgroundColor:'transparent',
		color:'#ffffff',
		height:40
	});		
	
	var lastUpdateText = Ti.UI.createLabel({
		text : ' Updated: ' + wx_timestamp,
		font:{fontSize:12,fontWeight:'normal'},
		color:'#ffffff',
		right:10
	});	        
	
	headerRow.add(lastUpdateText);		
	data.push(headerRow);

	var locationHeaderRow = Ti.UI.createTableViewRow({
		title:'Location',
		font:{fontSize:18,fontWeight:'bold'},
		backgroundImage:'/images/bgblue.png',
		backgroundColor:'transparent',
		color:'#ffffff'
	});
	data.push(locationHeaderRow);	
					
	data.push({
		title: title_city + "," + title_state,
		font:{fontSize:16,fontWeight:'normal'}
		});

	var conditionsHeaderRow = Ti.UI.createTableViewRow({
		title:'Current Conditions',
		font:{fontSize:18,fontWeight:'bold'},
		backgroundImage:'/images/bgblue.png',
		backgroundColor:'transparent',
		color:'#ffffff'
	});				        
	data.push(conditionsHeaderRow);
						
	data.push({
		title: text + "\n" +
		"Temp: " + temp + "F",
		leftImage: "/images/" + code + ".png",
		font:{fontSize:16,fontWeight:'normal'}
		});
	
	        
    //create forecast sections
	var forecastHeaderRow = Ti.UI.createTableViewRow({
		title:'5-Day Forecast',
		font:{fontSize:18,fontWeight:'bold'},
		backgroundImage:'/images/bgblue.png',
		backgroundColor:'transparent',
		color:'#ffffff'
	});				        
	data.push(forecastHeaderRow);

	// pull forecast data from database (status = 'forecast')
	status = "forecast";
	var sql = "select created,status,code,date,day,temp,high,low,text,title,lat,long,lastupdated from latest_weather where status = '" + status + "'";
	var dbrow = db.execute(sql);
	while (dbrow.isValidRow())
	{
		//var created = dbrow.fieldByName('created');
		//var status = dbrow.fieldByName('status');
		var code = dbrow.fieldByName('code');
		code = parseInt(code) + 1;
		//var date = dbrow.fieldByName('date');
		var day = dbrow.fieldByName('day');
		//var temp = dbrow.fieldByName('temp');
		var high = dbrow.fieldByName('high');
		var low = dbrow.fieldByName('low');
		var text = dbrow.fieldByName('text');
		//var title = dbrow.fieldByName('title');
		//var lat = dbrow.fieldByName('lat');
		//var lon = dbrow.fieldByName('lon');
		//var lastupdated = dbrow.fieldByName('lastupdated');
			
    	data.push({
			title: day + ": " + text + "\n" +
			"Hi/Lo: " + high + "F/" + low + "F",
			// REMOTE IMAGES DO NOT WORK HERE
			leftImage: "/images/" + code + ".png",
			font:{fontSize:16,fontWeight:'normal'}
			}); 
	dbrow.next();
    }
	dbrow.close();

	var table = Titanium.UI.createTableView({data:data});
    self.add(table);
//};


	// redraw on focus since user may have changed font size
	self.addEventListener('focus', function() {
		var d = new Date();
		var currentTS = parseInt(((d.getTime()) / 1000),10);
		var lastUpdatedTS = Titanium.App.Properties.getInt('lastUpdatedTS');
		if (checkNeedsUpdating(currentTS,lastUpdatedTS) && (Titanium.Network.networkType != Titanium.Network.NETWORK_NONE)) {
			runUpdate(xhrURL,currentTS);
		}	
		Ti.App.Properties.setInt('lastUpdatedTS', currentTS );		
	});
	
/*
	if (!isAndroid) {
		var refresh = Titanium.UI.createButton({
		    systemButton : Titanium.UI.iPhone.SystemButton.REFRESH,
		    backgroundColor : 'red'
		});
		self.setRightNavButton(refresh);
	}
	
	refresh.addEventListener('click',function(){
		var d = new Date();
		var currentTS = parseInt(((d.getTime()) / 1000),10);
		var lastUpdatedTS = Titanium.App.Properties.getInt('lastUpdatedTS');
		if  (Titanium.Network.networkType != Titanium.Network.NETWORK_NONE) {
			runUpdate(xhrURL,currentTS);
		}	
		Ti.App.Properties.setInt('lastUpdatedTS', currentTS );	
	});
*/
	return self;
}

module.exports = FirstView;
