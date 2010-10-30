var sys = require('sys')
  , url = require('url')
  , http = require('http')
  , eyes = require('eyes')
  , querystring = require('querystring')
  , io = require(__dirname + '/lib/socket.io-node')
  , journey = require('journey') // for json returning routes
  , PORT = 80 // MAKE SURE THIS IS SAME AS SOCKET.IO

  , static = require('node-static')
  
  // Create a node-static server to serve the current directory
  , fileServer = new static.Server('./public', { cache: 7200, headers: {'X-Hello':'Hakeru Rocks!'} });

// Firin up our in-built node server
var httpServer = http.createServer(function (request, response) {

  request.body = '';
  request.addListener('data', function(chunk){ request.body += chunk; });

  // now that we have the whole request body, let's do stuff with it.
  request.addListener('end', function () {
    
    var params = querystring.parse(url.parse(request.url).query);
    var posted = querystring.parse(request.body);
    for (var i in posted) {
      params[i] = posted[i]; // merging
    }
    eyes.inspect(params);

    var path = url.parse(request.url).pathname;
    switch(path) {
      
      // these routes are get/post/delete agnostic, but that's ok since we're doing simple stuff.
      case '/login.html':
        // process params or whatnot.

        // but will client cache it when we don't want them to? This is not an issue,
        // because the client should talk to URLs that return JSON in order to get data, and so 
        // there's no harm in caching a static page.
        fileServer.serveFile(path, 200, {}, request, response);
        break;
 
      case '/':
        path = '/index.html';
      case '/index.html':
        // some logic here to handle chat room redirects if logged-in.
        // ..code..
        
        // when we need them to go into a particular chat room, they first go to the
        // appropriate URL, then we detect they are going to a chatroom,
        // then we serve them a chat room page and let them cache it. 
        // Then once they've been served the page, they ask for the latest chat data from
        // one of our urls that returns JSON, not yet shown in this example.
        fileServer.serveFile(path, 200, {}, request, response);
        break;// all done!
      
      default:
        // here we actually serve the static file
        // (any paramater parsing or special logic has been dealt with already)
        // We could also be a 404 if it does not exist.
        fileServer.serve(request, response, function (err, res) {
          
          // might be better to totally ditch the switch statement and friggin
          // attempt to serve all static files, and then if not found attempt to serve up a chat room
          // and then if you can't find a chat room, serve a 404 dude.
          // that might be the best way, since I'm not sure if you can do a redirect up above in the 'index.html' case.
          // The reason we'd use the switch statement method is if people are hitting files that need to parse params and all that.
          // if node-static just served those files straight up, then we wouldn't get out hands on the information.
          // On the other hands, all reqs go through this callback, so this probably wouldn't be a problem.
          // Life's good, options eh?
          
          if (err) { // An error as occured
            sys.error("> Error serving " + request.url + " - " + err.message);
            fileServer.serveFile('/404.html', err.headers, err.headers, request, response);

          } else { // The file was served successfully
            console.log('> ' + request.url + ' - ' + res.message);
          }
        });
      break;
    }
  });
});


httpServer.listen(PORT);
console.log('> server is listening on http://127.0.0.1:' + PORT);


// All the socket.io magicx.
// just the basic chat demo for now.
var io = io.listen(httpServer),
    buffer = [];

io.on('connection', function(client){
  client.send({ buffer: buffer });
  client.broadcast({ announcement: client.sessionId + ' connected' });

  client.on('message', function(message){
    var msg = { message: [client.sessionId, message] };
    buffer.push(msg);
    if (buffer.length > 15) buffer.shift();
    client.broadcast(msg);
  });

  client.on('disconnect', function(){
    client.broadcast({ announcement: client.sessionId + ' disconnected' });
  });
});
