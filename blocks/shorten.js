// == INCLUDES ==
var redis = require('redis');
var shortid = require('shortid');
var validUrl = require('valid-url');

// == INSTANCE SETUP ==
var store = redis.createClient();


function vanity(options, resolve, reject){
  store.exists(options.vanity, function(err, reply){
    if(err){
      reject(err);
      return;
    }
    else{
      if(reply == 0) save(options.vanity, options.url, resolve, reject);
      else reject(new Error("Key already taken"));
    }
  });
}

function generate(options, resolve, reject){
  save(shortid.generate(), options.url, resolve, reject);
}

function save(key, url, resolve, reject){
  store.hmset(key, 'long', url, 'counter', 0, 'timestamp', (new Date()).getTime(), function(err, reply){
    if(err) reject(err);
    else(resolve({key:key, url: url}));
  });
}


module.exports.create = function(options){
  return new Promise(function(resolve, reject) {
    options.url = options.url.toLowerCase();
    if(options.url == undefined){
      reject(new Error("URI missing in options"));
      return;
    }
    if( !(options.url.indexOf('http://') === 0 || options.url.indexOf('https://') === 0) && !validUrl.isUri(options.url)){
      reject(new Error("URI not valid"));
      return;
    }
    if(options.vanity != undefined) vanity(options, resolve, reject);
    else generate(options, resolve, reject);
  });
}

module.exports.exists = function(key){
  return new Promise(function(resolve, reject){
    store.exists(key, function(err, reply){
      if(err){
        reject(err);
      } else {
        if(reply == 1) resolve(true);
        if(reply == 0) resolve(false);
      }
    });
  });
}

module.exports.resolve = function(key){
  return new Promise(function(resolve, reject){
    store.hget(key, "long", function(err, reply){
      if(err){
        reject(err);
      } else {
        resolve(reply);
      }
    });
    store.hincrby(key, "counter", 1);
  });
}
