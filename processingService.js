const {dbUtils} = require('./common/dbUtils');
const {Utils} = require('./common/utils');

class ProcessingService {
  
  static run() {
    this.collectUniqueOCIDs();
  }
  
  static async collectUniqueOCIDs() {
    dbUtils.deleteAll('ocids');
    await Utils.sleep(3000);  // delay used to avoid multiple callbacks
    
    dbUtils.collectDistinct('releases', 'ocid');
    dbUtils.collectDistinct('planning', 'ocid');
    dbUtils.collectDistinct('tender', 'ocid');
    dbUtils.collectDistinct('award', 'ocid');
    dbUtils.collectDistinct('contract', 'ocid');
    await Utils.sleep(1000);  // delay used to avoid multiple callbacks
    
    // find all unique OCID
    dbUtils.findAll('ocids', function (results) {
      const uniqueOCID = [...new Set(results.map(item => item.ocid))];
      
      console.log(results.length);
      console.log('uniqueOCID: ' + uniqueOCID.length);
      
      // extract from all unique OCID relevant information
      dbUtils.findAll('releases', function (results) {
        const releases = new Map(results.map(item => [item.ocid, item]));
        
        dbUtils.findAll('planning', function (results) {
          const plannings = new Map(results.map(item => [item.ocid, item]));
          
          dbUtils.findAll('tender', function (results) {
            const tenders = new Map(results.map(item => [item.ocid, item]));
            
            dbUtils.findAll('award', function (results) {
              const awards = new Map(results.map(item => [item.ocid, item]));
              
              dbUtils.findAll('contract', function (results) {
                const contracts = new Map(results.map(item => [item.ocid, item]));
                
                console.log('# releases: ' + releases.size);
                console.log('# plannings: ' + plannings.size);
                console.log('# tenders: ' + tenders.size);
                console.log('# awards: ' + awards.size);
                console.log('# contracts: ' + contracts.size);
                
                for (let ocid of uniqueOCID) {
                  // main template of a release
                  const release = releases.get(ocid);
                  
                  // if this objects contain information we will overwrite the 'release' object
                  const planning = plannings.get(ocid);
                  const tender = tenders.get(ocid);
                  const award = awards.get(ocid);
                  const contract = contracts.get(ocid);
                  
                  if (release !== undefined) {
                    if (planning !== undefined) {
                      release.planning = planning.planning;
                    }
                    
                    if (tender !== undefined) {
                      release.tender = tender.tender;
                    }
                    
                    if (award !== undefined) {
                      release.awards = award.awards;
                    }
                    
                    if (contract !== undefined) {
                      release.contracts = contract.contracts;
                    }
                  } else {
                    console.log('Something wrong happened. We didn\'t found a release for OCID: ' + ocid);
                  }
                }
                
                // save the complete releases in a new collection
                dbUtils.insertMany('complete_releases', [...releases.values()]);
              });
            });
          });
        });
      });
    });
  }
}

exports.ProcessingService = ProcessingService;
