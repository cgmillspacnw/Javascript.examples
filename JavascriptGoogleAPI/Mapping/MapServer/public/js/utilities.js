CGMApp.own.Utilities = (function() {

	function Utilities() {
		
	}
	
	Utilities.prototype.zeroFill = function(number, width) {
        console.log("debug: zeroFill called");
        width -= number.toString().length;
        if (width > 0) {
            return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
        }
        return number + "";
        // always return a string
    };

    Utilities.prototype.getToday = function() {
        console.log("debug: getToday called");
        var today = new Date();
        var day = today.getDate();        
        
        var month = today.getMonth() + 1;        
        var year = today.getFullYear();
        day = this.zeroFill(day, 2);
        month = this.zeroFill(month, 2);
        
        return month + '/' + day + '/' + year;
    };

	var isEmptyString = function(value) {
		return ((!value) || (value === "") );
	}

	Utilities.prototype.readyForUpdate = function(locationName, latitude, longitude) {
		var failure = isEmptyString(locationName) || isEmptyString(latitude) || isEmptyString(longitude);
		return !failure;
	}

	Utilities.prototype.deleteFromArray = function(array, value) {
		var index = array.indexOf(item);
		array.splice(index, 1);
	}
	
	Utilities.prototype.deleteFromArray2 = function(array, value) {
		var len = array.length - 1;
		while (len > 0) {
			pres = array[len--];
			if (pres.itemName === value) {
				array.splice(len + 1, 1);
				return;		
			}
		}
	}
	
	return Utilities;
})(); 