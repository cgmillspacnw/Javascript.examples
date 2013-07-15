/**
 * @author CGM from Charlie's archetypes
 */

/*global ELF:true*/

EasyMapLocation = (function() {

	function withValue(value) {
		var d = withValue.d || (withValue.d = {
			enumerable : false,
			writable : false,
			configurable : true,
			value : null
		});
		d.value = value;
		return d;
	}

	function Location(initCity, initLatitude, initLongitude, initDescription) {
		Object.defineProperty(this, "LocationName", withValue(initCity));
		Object.defineProperty(this, "Latitude", withValue(initLatitude));
		Object.defineProperty(this, "Longitude", withValue(initLongitude));
		Object.defineProperty(this, "Description", withValue(initDescription));
	}

	// Readonly, we can't init
	/*
	Location.prototype.init = function(initName, initStart, initEnd, initBorn, initDied) {
		this.PresidentName = initName;
		this.TermStart = initStart;
		this.TermEnd = initEnd;
		this.Born = initBorn;
		this.Died = initDied;
	}; */

	Location.prototype.initFromJSON = function(json) {
		this.LocationName = json.locationName;
		this.Latitude = json.latitude;
		this.Longitude = json.longitude;
		this.Description = json.description;
	};

	Location.prototype.toJSON = function() {
		return {
			locationName : this.LocationName,
			latitude : this.Latitude,
			longitude : this.Longitude,
			description : this.Description,
		};
	};

	return Location;
})();
