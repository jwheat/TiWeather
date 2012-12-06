/*
 * TiWeather
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

	// the meat and potatos .. and if you're a vegan ... this is the salad!
	function fetchData() {		
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

		return data;
	}

	data = fetchData();
	
	//var table = Titanium.UI.createTableView({data:data});
	var table = Titanium.UI.createTableView();
	table.setData(fetchData() );
	
	
// ------------------------------------------------------------------------------------------------------------
// pull to refresh code addition 
// http://developer.appcelerator.com/blog/2010/05/how-to-create-a-tweetie-like-pull-to-refresh-table.html

var border = Ti.UI.createView({
	backgroundColor:"#576c89",
	height:2,
	bottom:0
})
 
var tableHeader = Ti.UI.createView({
	backgroundColor:"#e2e7ed",
	width:320,
	height:60
});
tableHeader.add(border);

var arrow = Ti.UI.createView({
	backgroundImage:"/images/whiteArrow.png",
	width:23,
	height:60,
	bottom:10,
	left:20
});
 
var statusLabel = Ti.UI.createLabel({
	text:"Pull to reload",
	left:55,
	width:200,
	bottom:30,
	height:"auto",
	color:"#576c89",
	textAlign:"center",
	font:{fontSize:13,fontWeight:"bold"},
	shadowColor:"#999",
	shadowOffset:{x:0,y:1}
});
 
var lastUpdatedLabel = Ti.UI.createLabel({
	text:"Last Updated: "+formatDate(),
	left:55,
	width:200,
	bottom:15,
	height:"auto",
	color:"#576c89",
	textAlign:"center",
	font:{fontSize:12},
	shadowColor:"#999",
	shadowOffset:{x:0,y:1}
});
var actInd = Titanium.UI.createActivityIndicator({
	left:20,
	bottom:13,
	width:30,
	height:30
});

tableHeader.add(arrow);
tableHeader.add(statusLabel);
tableHeader.add(lastUpdatedLabel);
tableHeader.add(actInd);

function formatDate()
{
	var d = new Date;
	var datestr = d.getMonth()+'/'+d.getDate()+'/'+d.getFullYear();
	if (d.getHours()>=12)
	{
           datestr+=' '+(d.getHours()==12 ? 
              d.getHours() : d.getHours()-12)+':'+
              d.getMinutes()+' PM';
	}
	else
	{
		datestr+=' '+d.getHours()+':'+d.getMinutes()+' AM';
	}
	return datestr;
}

table.headerPullView = tableHeader;

table.addEventListener('scroll',function(e)
{
	var offset = e.contentOffset.y;
	if (offset <= -65.0 && !pulling)
	{
		var t = Ti.UI.create2DMatrix();
		t = t.rotate(-180);
		pulling = true;
		arrow.animate({transform:t,duration:180});
		statusLabel.text = "Release to refresh...";
	}
	else if (pulling && offset > -65.0 && offset < 0)
	{
		pulling = false;
		var t = Ti.UI.create2DMatrix();
		arrow.animate({transform:t,duration:180});
		statusLabel.text = "Pull down to refresh...";
	}
});
table.addEventListener('scrollEnd',function(e)
{
	Ti.API.info ("Reloading...");
	if (pulling && !reloading && e.contentOffset.y <= -65.0)
	{
		reloading = true;
		pulling = false;
		arrow.hide();
		actInd.show();
		statusLabel.text = "Reloading...";
		Ti.API.info ("Reloading...");
		table.setContentInsets({top:60},{animated:true});
		arrow.transform=Ti.UI.create2DMatrix();
		//beginReloading();
	}
	
	var lastUpdatedTS = Titanium.App.Properties.getInt('lastUpdatedTS');
	var wxLocation = Titanium.App.Properties.getInt('wxLocation');

	// Since the weather feed doesn't update that often - I alter the zipcode here
	// Hopefully the weather is different enough you can see more than just the location change	
	if (wxLocation == '17019') {
		var wxLocation = '14424';  // Canandaigua,NY (hometown)
	} else {
		var wxLocation = '17019';  // Dillsburg, PA (current town)
	}
	Ti.App.Properties.setInt('wxLocation', wxLocation);
	
	runUpdate(wxLocation,currentTS);
	setTimeout(endReloading,2000);
		
});

function endReloading()
{
	table.setData(fetchData() );
}

var pulling = false;
var reloading = false;


// ------------------------------------------------------------------------------------------------------------

	
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
