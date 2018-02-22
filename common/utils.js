var fs = require('fs');

class Utils {
	static loadExternalConfiguration() {
		return new Promise(
				function(resolve, reject) {
	    try {
	        var fs = require('fs');
	        var parsedData = {};
	        var file = __dirname + '../../conf/conf.json'; 
	        if (fs.existsSync(file)) {
	            var data = fs.readFileSync(file, 'utf8')
	            var parsedData = JSON.parse(data);           
	        } 
	        resolve(parsedData)
	    } catch (e) {
	        reject("Can't parse config file ");
	    }
	  });
	}
}

exports.Utils = Utils;