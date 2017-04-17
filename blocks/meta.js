// == INCLUDES ==
var MetaInspector = require('node-metainspector');

module.exports = function(url){
  return new Promise(function(resolve, reject){
    var client = new MetaInspector(url , { timeout: 5000 });
    client.on("fetch", function(){
      var returned = {};
      returned.title = (client.ogTitle || client.title);
      returned.description = (client.ogDescription || client.description);
      returned.absolute = client.response.request.href;
      if(client.images.length != 0) returned.image = client.images['0'];

      console.log(returned);
      resolve(returned);
    });
    client.on("error", function(err){
      reject(err);
    });
    client.fetch();
  });
}
