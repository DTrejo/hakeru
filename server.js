var sys = require('sys')
  , url = require('url')
  , http = require('http')
  , querystring = require('querystring')
  , jqserve = require('jqserve')
  , session = require('sesh').session
  , PORT = 80; // MAKE SURE THIS IS SAME AS SOCKET.IO

// Firin up our in-built node server
var httpServer = http.createServer(function (request, response) {
  session(request, response, function(request, response){
    // now we can access request.session

    request.body = '';
    request.addListener('data', function(chunk){ request.body += chunk; });
    
    // console.log(request.url);
    var parsed = url.parse(request.url);
    var params = querystring.parse(parsed.query);
    var posted = querystring.parse(request.body);
    for (var i in posted) { params[i] = posted[i]; }  // merging

    // now that we have the whole request body, let's do stuff with it.
    request.addListener('end', function () {
      // console.log(JSON.stringify(params));

      switch(parsed.pathname) {
        case '/':
        case '/index.html':
          jqserve(request, response, 'index.html');
          break;

        // these routes are get/post/delete agnostic, but that's ok since we're doing simple stuff.
        case '/login.json':
          params.userid; // check this against db
          params.password; // check this against md5 version in DB.
          params.pipeName;
          // console.log(request.session.data);
          if (params.userid == 'johnny' && params.password == 'j') {
            request.session.data.user = params.userid;
            sendJson(response, { msg: 'success' });
          } else {
            sendJson(response, { msg: 'Bad combination - Try again?' });
          }
          break;
          
        case '/logout':
          request.session.data.user = 'Guest';
          redirect(response, request, '/index.html', 302);
          break;
        
        case '/notify':
        case '/notify.html':
          jqserve(request, response, '/notify.html', function(err, $) {
            var link = $('#link');
            link.attr('href', 'http://'+request.headers.host+ '/' + params.pipe + '/#' + params.hash);
            $('#title').text(params.title);
            $('#msg').text(params.msg);
          });
          break;
          
        // case '/upload':
        //   // move code from chat server into here.
        //   break;

        default:
          // need to serve chatrooms here if url is of form /*
          var hashstripped = parsed.pathname.substring(0, parsed.pathname.lastIndexOf('/#'));
          if (/^(\/)((?:[a-z][a-z0-9_]*))$/i.test(parsed.pathname)) {
            // console.log('user:',request.session.data.user);
            // console.log('history:',request.session.data.history);
            if (request.session.data.user === 'Guest') {
              redirect(response, request, '/login.html', 302);
              return;
              
            } else { // they are logged in, so give them a room
              jqserve(request, response, '/room.html', function(err, $) {
                if (err) console.log(err);
                var userid = $('<link/>').attr('id', 'userid')
                                         .attr('userid', request.session.data.user);
                $('head').append(userid);
              });
              return;
            }
          }
          
          // else, serve static
          jqserve(request, response);
        break;
      }
    });

  });
});

function sendJson(response, json) {
  console.dir(json);
  var text = JSON.stringify(json);
  response.writeHead(200, {'Content-Type':'application/json', 'Content-Length':text.length});
  console.log(text);
  response.end(text); // problem with sending this?
}

function redirect(res, req, location, status) {
  location = req.headers.host + location + '?' + req.url;
  var html = ['<html><head>'
             // , '<meta http-equiv="Refresh" content="0; url=http://'+location+'" />'
             , '</head><body>'
             , '<p>Please go to <a href="http://'+location+'">'+location+'</a>!</p>'
             , '</body></html>'
             ].join('\n');
  res.writeHead(status, { 'Content-Type': 'text/html'
                        , 'Content-Length': html.length
                        , 'Location': 'http://' + location
                        });
  res.end(html);
}

httpServer.listen(PORT);
var chatServer = require('./hakeru.js');
chatServer.listen(httpServer);
console.log('> server is listening on http://127.0.0.1:' + PORT + '/');
