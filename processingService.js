const {dbUtils} = require('./common/dbUtils');

class ProcessingService {
  
  static run() {
    this.collectUniqueOCIDs();
  }
  
  static collectUniqueOCIDs() {
    dbUtils.collectDistinct('planning', 'ocid');
    dbUtils.collectDistinct('tender', 'ocid');
    dbUtils.collectDistinct('award', 'ocid');
    dbUtils.collectDistinct('contract', 'ocid');
  }
}

exports.ProcessingService = ProcessingService;
