const {ajaxUtils} = require('./common/ajaxUtils');
const {dbUtils} = require('./common/dbUtils');
const promiseSerial = funcs =>
  funcs.reduce((promise, func) =>
      promise.then(result => func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([])
  );

class ScrappingService {
  static fetchData(step, page) {
    console.log('fetching ' + step + ', page ' + page);
    const url = 'http://gpp.ppda.go.ug/api/v1/releases?page=' + page;
    return ajaxUtils.get(url, {});
    
  }
  
  static fetchAndSave(step, page) {
    return this.fetchData(step, page).then(function (response) {
      if (response.data.message) {
        console.log('inserting error message ' + step + ', page ' + page);
        dbUtils.insertMany('errors', [{step: step, page: page, message: response.data.message}]);
      } else {
        console.log('inserting ' + step + ', page ' + page + ' of ' + response.data.pagination.last_page);
        dbUtils.insertMany(step, response.data.releases);
      }
      
      return response.data.pagination.last_page;
    }).catch(function (err) {
      console.log('error: ' + step + ' , page ' + page);
      console.log(err.response.data);
      dbUtils.insertMany('errors', [{step: step, page: page, message: err.response.data.message}]);
    });
  }
  
  static fetch(step) {
    return this.fetchData(step, 1)
      .then(function (resp) {
        const requestParams = [];
        let last_page = resp.data.pagination.last_page;
        for (let page = 1; page <= last_page; page++) {
          requestParams.push({step: step, page: page});
        }
        
        const requests = requestParams.map(params => () => this.fetchAndSave(params.step, params.page));
        promiseSerial(requests)
          .then(console.log.bind(console))
          .catch(console.error.bind(console));
        
      }.bind(this));
  }
  
  static run() {
    this.cleanup();
    this.fetch('procurements');
    /*this.fetch('planning');
    this.fetch('tender');
    this.fetch('award');
    this.fetch('contract');
    this.fetch('implementation');*/
  }
  
  static cleanup() {
    /*dbUtils.deleteAll('planning');
    dbUtils.deleteAll('tender');
       dbUtils.deleteAll('award');
       dbUtils.deleteAll('contract');
       dbUtils.deleteAll('implementation');*/
    dbUtils.deleteAll('procurements');
    dbUtils.deleteAll('errors');
  }
}

exports.ScrappingService = ScrappingService;
