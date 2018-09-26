const fs = require('fs');
const {dbUtils} = require('./dbUtils');

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
  
  static createOrgs(releases) {
    dbUtils.getDB(function (db) {
      const organization = db.collection('organization');
      organization.createIndex({"name": 1}, {unique: true});
      organization.createIndex({"additionalIdentifiers._id": 1});
  
      for (let release of releases) {
        Utils.createOrgsFromRelease(release, db);
      }
    });
  }
  
  static createOrgsFromRelease(release, db) {
    if (release.tender != null) {
      if (release.tender.procuringEntity != null) {
        Utils.createOrgFromField(release.tender.procuringEntity, "procuringEntity", db);
      }
      if (release.buyer != null) {
        Utils.createOrgFromField(release.buyer, "buyer", db);
      }
      if (release.tender.tenderers != null) {
        release.tender.tenderers.forEach(t => Utils.createOrgFromField(t, "bidder", db));
      }
    }
    if (release.bids != null && release.bids.details != null && release.bids.details.tenderers != null) {
      release.bids.details.tenderers.forEach(t => Utils.createOrgFromField(t, "bidder", db));
    }
    if (release.awards != null) {
      release.awards.forEach(award => award.suppliers.forEach(s => Utils.createOrgFromField(s, "supplier", db)));
    }
  }
  
  static createOrgFromField(orgField, fieldType, db) {
    let org = Utils.findOrgInCollection(orgField, db);
  
    console.log(org);
    
    if (org != null) {
      if (orgField.name != null && orgField.name === org.name) {
        db.collection('organization').updateOne({
          name: org.name
        }, {
          $addToSet: {
            additionalIdentifiers: orgField.identifier,
            roles: fieldType
          }
        });
      } else {
        db.collection('organization').updateOne({
          _id: org._id
        }, {
          $addToSet: {
            additionalNames: orgField.name,
            additionalIdentifiers: orgField.identifier,
            roles: fieldType
          }
        });
      }
    } else {
      org = orgField;
      if (orgField._id == null) {
        org._id = orgField.name;
      } else {
        org._id = orgField._id;
      }
      if (org.roles == null) {
        org.roles = [];
      }
      if (!org.roles.includes(fieldType)) {
        org.roles.push(fieldType);
      }
  
      console.log(">>>> inserted organization!");
      db.collection('organization').insertOne(org);
    }
  }
  
  static findOrgInCollection(orgField, db) {
    let org;
    if (orgField.name != null && orgField._id != null) {
      org = db.collection('organization').findOne({
        $or: [
          {
            _id: orgField._id
          }, {
            "additionalIdentifiers._id": orgField._id
          }, {
            name: orgField.name
          }
        ]
      });
    } else {
      if (orgField.name != null) {
        org = db.collection('organization').findOne({name: orgField.name});
      } else {
        org = db.collection('organization').findOne({
          $or: [
            {
              _id: orgField._id
            }, {
              "additionalIdentifiers._id": orgField._id
            }
          ]
        });
      }
    }
    return org;
  }
}

exports.Utils = Utils;
