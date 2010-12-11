// 
// Serve a request against an html file after modifying said file with arbitrary jquery 
// before it is served.
// Modified files will be cached based on file path. Caches unlimited files. This could
// cause memory problems, and will be patched at some point.
// For convenience, if no function or path are given, node-static will be used to serve the file.
// 

module.exports = jqserve;

var util = require('sys')
  , fs = require('fs')
  , jsdom  = require('jsdom').jsdom
  , ns = require('node-static')
  , fileServer = new ns.Server('./public', { cache: 7200, headers: {'X-Hello':'World!'} });

// takes a path and a function,
// reads file at that path, makes a window out of it.
// applies the function to the window, then serves the modified version.
// Caches the raw files read from disk, so things are faster.
// If there was no function specified, it uses node static to serve the file. 
// If no path was specified, uses the path found in req.url. path must be relative to public folder!
var fileCache = {};

function jqserve(req, res, path, fun) {
  if (path) req.url = '/'+path; // problem here?
  
  if (!fun) {
    staticServe(req,res);
    return;
  } 
  
  var text = fileCache[path];
  if (text) {
    modifyAndServe(null, res, text, fun);
  
  // read it from disk and save it. Also watch the files so 
  // the cache can be refreshed if the file changes.
  } else {
    // security problem w/ using path this way? I think not?
    
    fs.readFile('./public/' + path, 'utf8', function (err, text) {
      fileCache[path] = text;
      modifyAndServe(err, res, text, fun);
    });
    
    // watch it for changes, so server restart
    // is not needed to clear cache
    fs.watchFile('./public/' + path, function (curr, prev) {
      if ((prev.mtime + '') != (curr.mtime + '')) {
        fs.readFile('./public/' + path, 'utf8', function (err, text) {
          fileCache[path] = text;
        });
      }
    });
  }
}

// Takes a request, response, raw html string, and a jquery function 
// to run the file through.
// serves the request the string after being processed by jquery.
// takes about 20ms
function modifyAndServe(err, res, text, fun) {
  window = jsdom(text).createWindow();
  
  // new instance each time
  $ = require('jquery').create(window);

  // do templating stuff
  fun(err, $);

  // extract the html
  html = window.document.doctype + window.document.documentElement.innerHTML;
  
  // serve it
  res.writeHead(200, {'Content-Type':'text/html', 'Content-Length':html.length});
  res.end(html);
}

// Serves the given request using node-static.
// tries to serve /404.html if it can't find the file.
function staticServe(req, res) {
  fileServer.serve(req, res, function (err, result) {
    
    if (err) { // An error as occurred
      util.error("> Error serving " + req.url + " - " + err.message + ' - '+ err.status);
      // if you put 404 as the status, it won't get to the client
      fileServer.serveFile('404.html', 200, err.headers, req, res);

    } else { 
      // The file was served successfully
      // console.log('> ' + request.url + ' - ' + res.message);
      // console.log('hit static');  
    }
  });
}
