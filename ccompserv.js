var util = require('util')
  , url = require('url')
  , http = require('http')
  , querystring = require('querystring')
  , PORT = 8080
  , jqserve = require('jqserve')
  , api = require('./api');


// Firin up our in-built node server
var httpServer = http.createServer(function (request, response) {

  request.body = '';
  request.addListener('data', function(chunk){ request.body += chunk; });
  var parsed = url.parse(request.url);
  var params = querystring.parse(parsed.query);
  var posted = querystring.parse(request.body);
  for (var i in posted) { params[i] = posted[i]; }  // merging

  // now that we have the whole request body, let's do stuff with it.
  request.addListener('end', function () {
    console.log(parsed.pathname);
    switch(parsed.pathname) {
      case '/':
        jqserve(request, response, 'index.html');
        break;

      case '/api/uglify':
        console.log(params);
        var json = {};
        api.uglify(params.js, function(error, result) {
          json.compressed = error ? error : result;
          sendJson(response, json);
        });
        break;
        
      case '/api/jsmin':
        console.log(params);
        var json = {};
        api.jsmin(params.js, function(error, result) {
          json.compressed = error ? error : result;
          sendJson(response, json);
        });
        break;
        
      case '/api/all':
        console.log(params);
        var json = {};
        api.uglify(params.js, function(error, result) {
          json.uglify = error ? error : result;

          api.jsmin(params.js, function(error, result) {
            json.jsmin = error ? error : result;
            sendJson(response, json);
          });
        });
        break;
      

      default:
        jqserve(request, response);
        break;
    }
  });
});

function getHTML(graphid){
  var arr = weakassdb[graphid];
  if (arr) return (arr[1]+'').replace(/\//g,'\\/').replace(/"/g,'\\"').replace(/'/g,"\\'");
  return '<h1>no embed</h1>';
}

function sendJson(response, json) {
  console.dir(json)
  var text = JSON.stringify(json);
  response.writeHead(200, {'Content-Type':'application/json', 'Content-Length':text.length});
  console.log(text);
  response.end(text); // problem with sending this?
}

httpServer.listen(PORT);
console.log('> server is listening on http://127.0.0.1:' + PORT + '/');
