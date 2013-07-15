/**
 * @author cgm pillaged shamelessly from Charlie Calvert
 */
 
CGMApp.own.AjaxBase = (function() {
 	
 	function AjaxBase() {
 	}
 	
 	AjaxBase.prototype.readJson = function(docName, success, failure) {
 		$.ajax({
			type : 'GET',
			url : '/couchReadDoc',
			cache : false,
			data: { 'docName': docName },
			dataType : "json",
			success : success,
			error: failure
		});
 	}
 	
 	AjaxBase.prototype.writeJson = function(docName, data, typeRequest, success, failure) {
 		$.ajax({
			type : typeRequest,
			//url : '/writeJson',
			url : '/couchWriteDoc',
			cache : false,
			data: { 'docName': docName, 'myData': data},
			dataType : "json",
			success : success,
			error: failure
		});
 	}
 	
 	AjaxBase.prototype.noData = function(urlRequest, success, failure) {
        $.ajax({
            type : 'GET',
            url : urlRequest,
            cache : false,
            dataType : "json",
            success : success,
            error: failure
        });
    }

 	return AjaxBase; 
 })();
