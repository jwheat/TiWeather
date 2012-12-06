//Application Window Component Constructor
function ApplicationWindow() {
	//load component dependencies
	var FirstView = require('ui/common/FirstView');
		
	//create component instance
	var self = Ti.UI.createWindow({
		backgroundColor:'#ffffff',
		//modal:true ,
		title : 'TiWeather'
	});
		
	//construct UI
	var firstView = new FirstView();
	self.add(firstView);

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
	
	return self;
}

//make constructor function the public component interface
module.exports = ApplicationWindow;
