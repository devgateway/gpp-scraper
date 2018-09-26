const {Utils} = require('./common/utils');
const {ScrappingService} = require('./scrappingService');
const {ProcessingService} = require('./processingService');

Utils.loadExternalConfiguration().then(function (data) {
  global.config = data;
  
  console.log(global.config);
  
  // un comment this to re-run the import (!warning! this will delete all the existing data)
  // ScrappingService.run();
  ProcessingService.run();
}).catch(function (error) {
  console.log(error);
});
