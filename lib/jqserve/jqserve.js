// 
// Run a request through this to run arbitrary jquery against the file before it is served.
// Modified files will be cached based on file path and the function that was applied.
// For convenience, if no function is given, node-static will be used to serve the file.
// 

module.exports = jqserve;

var util = require('util')
  , fs = require('fs')
  , jsdom  = require('jsdom').jsdom
  , ns = require('node-static')
  , fileServer = new ns.Server('./public', { cache: 7200, headers: {'X-Hello':'World!'} });

// takes a path and a function,
// reads file at that path, makes a window out of it.
// applies the function to the window, then serves the modified version.
// Caches the result of a function applied to a certain file, so there's no need to reprocess.
// If there was no function specified, it uses node static to serve the file. 
// If no path was specified, uses the path found in req.url. path must be relative to public folder!
var cache = {}
  , html = ''
  , hash = ''
  , $ = function(){}; // Should probably move all these into the function?

function jqserve(req, res, path, fun) {
  if (path) req.url = '/'+path; // problem here?
  
  if (!fun) {
    staticserve(req,res);
    
  } else { 
    // security problem w/ using path this way? I think not?
    fs.readFile('./public/' + path, 'utf8', function (err, text) {
      if (err) fun(err);

      hash = path+fun;
      if (cache[hash]) { 
        // just serve the cached version.
        html = cache[hash];
        // console.log('jq cache hit');

        // generate it on the fly.
      } else { 
        window = jsdom(text).createWindow();
        
        // new instance each time
        $ = require('jquery').create(window);


        // do templating stuff
        fun(null,$);

        // extract the html
        html = window.document.doctype + window.document.documentElement.innerHTML;

        // so future calls will be super fast
        cache[hash] = html;
        // console.log('generated '+path);
        // console.dir(cache);
      }

      // serve it
      res.writeHead(200, {'Content-Type':'text/html', 'Content-Length':html.length});
      res.end(html);
    });
  }
}

// Serves the given request using node-static.
// tries to serve /404.html if it can't find the file.
function staticserve(req, res) {
  fileServer.serve(req, res, function (err, result) {
    
    if (err) { // An error as occurred
      util.error("> Error serving " + req.url + " - " + err.message + ' - '+ err.status);
      // if you put 404 as the status, it won't get to the client
      fileServer.serveFile('404.html', 200, err.headers, req, res);

    } else { // The file was served successfully
      // console.log('> ' + request.url + ' - ' + res.message);
      // console.log('hit static');  
    }
  });
}
