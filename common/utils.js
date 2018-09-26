const fs = require('fs');

class Utils {
  static loadExternalConfiguration() {
    return new Promise(
      function (resolve, reject) {
        try {
          const fs = require('fs');
          const file = __dirname + '/../conf/conf.json';
          let parsedData = {};
          
          if (fs.existsSync(file)) {
            const data = fs.readFileSync(file, 'utf8');
            parsedData = JSON.parse(data);
          }
          resolve(parsedData);
        } catch (e) {
          reject("Can't parse config file ");
        }
      });
  }
  
  static sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
  }
}

exports.Utils = Utils;
