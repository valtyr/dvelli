// == INCLUDES ==
var express = require('express');
var shorten = require('./blocks/shorten.js');
var meta = require('./blocks/meta.js');
var bodyParser = require('body-parser');
var path = require('path');

// == INSTANCE SETUP ==
var app = express();

// == MIDDLEWARE SETUP ==
app.use(bodyParser.urlencoded({extended: true}));
app.use('/static', express.static('static'));

// == EXPRESS ROUTES ==
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'static/html/index.html'));
});
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
app.post('/info', function(req, res){
  meta(req.body.url).catch(function(err){
    res.status(400).json({ success: false, reason: err.message });
  }).then(function(meta){
    meta.success = true;
    res.json(meta);
  });
});

// == START SERVER ==
var server_port = process.env.PORT || 3000;
app.listen(server_port, function () {
  console.log('Listening on '+server_port+'');
});
