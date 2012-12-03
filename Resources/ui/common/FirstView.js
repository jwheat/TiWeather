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


function FirstView() {
	//create object instance, a parasitic subclass of Observable
	var self = Ti.UI.createView();
	
// === WEATHER CODE 
		wx_location = "17019";
		
		var actInd = Titanium.UI.createActivityIndicator({
			bottom:10, 
			height:50,
			width:10,
			message:'Loading weather info...',
			style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
		});
		actInd.show();

		var xhr = Titanium.Network.createHTTPClient();
		
		xhr.onload = function()
		{
			var jsonObject = JSON.parse(this.responseText);

			var title = jsonObject.query.results.item.title;
			var current = jsonObject.query.results.item;
			var forecast = current.forecast;
			
			// create the table array
			var data = [];
					
			// Parse Time/Date to what we want
			// "pubDate":"Fri, 30 Nov 2012 10:55 am EST",
			// timestamp : 10:55 am EST
			// date      : Fri, 30 Nov 2012
			var wx_time_array = current.pubDate.split(" ");
			var wx_timestamp = wx_time_array[4] + wx_time_array[5] + " " + wx_time_array[6];
			var wx_date = wx_time_array[0] + " " + wx_time_array[1] + wx_time_array[2] + wx_time_array[3] 
			
			// Parse Title to what we want
			// "title":"Conditions for Dillsburg, PA at 10:55 am EST"
			// city  : Conditions for Dillsburg
			// state : PA
			var wx_title_array = current.title.split(",");
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
				text : 'Last Updated: ' + wx_timestamp,
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
				title: current.condition.text + "\n" +
				"Temp: " + current.condition.temp + "F",
				leftImage: "/images/" + current.condition.code + ".png",
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
			
	        for (var i = 0; i < forecast.length; i++) {
	        	data.push({
					title: forecast[i].day + ": " + forecast[i].text + "\n" +
					"Hi/Lo: " + forecast[i].high + "F/" + forecast[i].low + "F",
					// REMOTE IMAGES DO NOT WORK HERE
					leftImage: "/images/" + forecast[i].code + ".png",
					font:{fontSize:16,fontWeight:'normal'}
					}); 
	        }
			actInd.hide();
			
			
			
			
			var table = Titanium.UI.createTableView({data:data});
		    self.add(table);
		};


		// open the client
		xhr.open('GET',"http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D'http%3A%2F%2Fxml.weather.yahoo.com%2Fforecastrss%2F"+wx_location+"_f.xml'&format=json");
	    
		// send the data
		xhr.send();
	
	return self;
}

module.exports = FirstView;
