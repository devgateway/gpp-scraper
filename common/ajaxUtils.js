var Axios = require('axios');

class ajaxUtils {	
	static get(url, params) {
		return new Promise(
			function(resolve, reject) {
				Axios.get(url, {
						responseType: 'json',
						params: params
					})
					.then(function(response) {
						resolve(response);
					})
					.catch(function(response) {
						reject(response);
					});
			});
	}
}

exports.ajaxUtils = ajaxUtils;