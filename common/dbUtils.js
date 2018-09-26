const MongoClient = require('mongodb').MongoClient;

class dbUtils {
  static url() {
    return 'mongodb://' + global.config.MONGO_DB.host + ':' + global.config.MONGO_DB.port;
  }
  
  static async insertMany(collectionName, data) {
    let client;
    try {
      client = await MongoClient.connect(this.url());
      const db = client.db(global.config.MONGO_DB.dbName);
      const collection = db.collection(collectionName);
      let r = await collection.insertMany(data);
    }
    catch (err) {
      console.log(err.stack);
    }
    
    client.close();
  }
  
  static async deleteAll(collectionName) {
    let client;
    try {
      client = await MongoClient.connect(this.url());
      const db = client.db(global.config.MONGO_DB.dbName);
      const collection = db.collection(collectionName);
      let r = await collection.deleteMany({});
      console.log("deleted: " + r.deletedCount);
    }
    catch (err) {
      console.log(err.stack);
    }
    
    client.close();
  }
  
  static async collectDistinct(collectionName, field) {
    let client;
    try {
      client = await MongoClient.connect(this.url());
      const db = client.db(global.config.MONGO_DB.dbName);
      const collection = db.collection(collectionName);
      
      collection.distinct(field, function (err, result) {
        let docs = result.map(function (ocid) {
          return {'ocid': ocid};
        });
  
        dbUtils.insertMany('ocids', docs);
      });
    }
    catch (err) {
      console.log(err.stack);
    }
    
    client.close();
  }
  
  static async findAll(collectionName, callback) {
    let client;
    
    client = await MongoClient.connect(this.url());
    const db = client.db(global.config.MONGO_DB.dbName);
    const collection = db.collection(collectionName);
  
    collection.find({}).toArray(function (err, result) {
      if (err) {
        throw err;
      }
      
      client.close();
      
      callback(result);
    });
  }
}

exports.dbUtils = dbUtils;
