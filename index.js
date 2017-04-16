// == INCLUDES ==
var express = require('express');
var shorten = require('./blocks/shorten.js');
var bodyParser = require('body-parser');

// == INSTANCE SETUP ==
var app = express();

// == MIDDLEWARE SETUP ==
app.use(bodyParser.urlencoded())

// == EXPRESS ROUTES ==
app.get('/:key', function(req, res){
  shorten.resolve(req.params.key).catch(function(err){
    res.status(400).json({ success: false, reason: err.message });
  }).then(function(resolved){
    if(resolved == null){
      res.redirect('/');
    } else {
      res.redirect(resolved);
    }
  })
});
app.post('/shorten', function(req, res){
  console.log(req.body);
  if(req.body.url == undefined){
    res.status(400).json({
      success: false,
      reason: 'URL not provided'
    });
    return;
  } else {
    var options = {url: req.body.url};
    if(req.body.vanity != undefined) options.vanity = req.body.vanity;
    shorten.create(options).catch(function(err){
      res.status(400).json({ success: false, reason: err.message });
    }).then(function(val){
      val.success = true;
      res.json(val);
    });
  }
});
app.get('/exists/:key', function(req, res){
  shorten.exists(req.params.key).catch(function(err){
    res.status(400).json({ success: false, reason: err.message });
  }).then(function(exists){
    res.json({
      success: true,
      exists: exists
    });
  });
});

// == START SERVER ==
var server_port = process.env.PORT || 3000;
app.listen(server_port, function () {
  console.log('Listening on '+server_port+'');
});
