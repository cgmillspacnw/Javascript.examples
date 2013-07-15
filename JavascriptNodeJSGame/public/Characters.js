/**
 * @author cgm pillaged from Charlie Calvert
 */

CGMApp.own.Characters = (function() {
	
	function Characters () {
		
	}
	
	Characters.prototype.Foo = 'Wanda';
	
	Characters.prototype.init = function () {
		Object.defineProperty(this, "Hero", withValue('Hero'));
		Object.defineProperty(this, "Orc", withValue('Orc'));
	}
	
	function withValue(value) {
		var d = withValue.d || (withValue.d = {
			enumerable : false,
			writable : true,
			configurable : true,
			value : null
		});
		d.value = value;
		return d;
	}

	// Create the Test Scoring tables.
	Characters.prototype.createCharacterTable = function(traits, selector) {
		var table = $(selector);
		table.empty();
		table.append("<tr><th>Stat</th><th>Value</th></tr>");		// the headers
		for (var trait in traits) {		// Display in Random order?
			if (( "_rev" == trait) || ( "_id" == trait)){
				continue;
			}
			table.append("<tr><td>" + trait + "</td><td id=" + trait.toLowerCase() + ">" + traits[trait] + "</td></tr>");
		}		
	};
	
	return Characters;
})();
