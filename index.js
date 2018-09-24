var {Utils} = require('./common/utils');
var {ScrappingService} = require('./scrappingService');
var {ProcessingService} = require('./processingService');


Utils.loadExternalConfiguration().then(function (data) {
  global.config = data;
  
  console.log(global.config);
  
  ScrappingService.run();
  // ProcessingService.run();
}).catch(function (error) {
  console.log(error);
});
