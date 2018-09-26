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
  
  static prepareData(obj, parent) {
    if (obj == null) {
      return;
    }
    
    Object.keys(obj).forEach(function (element) {
      if (Array.isArray(obj[element])) {
        obj[element].forEach(function (arrayElement) {
          Utils.prepareData(arrayElement, element);
        });
      } else if (typeof obj[element] === "object") {
        if (element === "identifier") {
          obj["_id"] = obj[element].id;
        }
        Utils.prepareData(obj[element], element);
      } else if (element.toLowerCase().includes("date")) {
        obj[element] = new Date(obj[element]);
      } else if (element === "id") {
        if (parent == null) {
          obj["uaId"] = obj[element];
        } else {
          obj["_id"] = obj[element];
        }
        delete obj[element];
      }
    });
  }
}

exports.Utils = Utils;
