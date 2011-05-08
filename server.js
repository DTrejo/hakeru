var sys = require('sys')
  , url = require('url')
  , http = require('http')
  , crypto = require('crypto')
  , querystring = require('querystring')
  , jqserve = require('./lib/jqserve/jqserve.js')
  , session = require('sesh').session
  , PORT = 80 // MAKE SURE THIS IS SAME AS SOCKET.IO

  , Db = require('mongodb').Db
  , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server
  , BSON = require('mongodb').BSONPure
  , mongo = new Db('hakeru', new Server(process.env.DUOSTACK_DB_MONGODB
                                       || "localhost", 27017, {}))

  , formidable = require('formidable');


// Firin up our in-built node server
var httpServer = http.createServer(function (request, response) {
  session(request, response, function(request, response) {
    // now we can access request.session

    request.body = '';
    request.addListener('data', function(chunk){ request.body += chunk; });

    // now that we have the whole request body, let's do stuff with it.
    request.addListener('end', function () {
      // merge url params and posted params. This could be dangerous in the future.
      var parsed = url.parse(request.url)
        , params = querystring.parse(parsed.query)
        , posted = querystring.parse(request.body);
      for (i in posted) { params[i] = posted[i]; }

      switch(parsed.pathname) {
        case '/':
        case '/index.html':
          jqserve(request, response, 'index.html');
          break;

        // these routes are get/post/delete agnostic, but that's ok since we're doing simple stuff.
        case '/login.json':
          console.log("loggin in");
          mongo.collection('users', function(err, collection){
            collection.findOne({'username': params.userid, 'password': encrypt(params.password)}, function(err, doc) {
              if (doc != undefined) {
                request.session.data.user = params.userid;
                sendJson(response, { msg: 'success' });
              } else {
                sendJson(response, { msg: 'Bad combination - Try again?' });
              }
            });
            params.userid; // check this against db
            params.password; // check this against md5 version in DB.
            params.pipeName; // useful in future for making sure has access to pipe
          });
          break;
        case '/register.json':
            mongo.collection('users', function(err, collection){
              collection.findOne({'username': params.userid}, function(err, doc) {
                if (doc != undefined) {
                  sendJson(response, { msg: 'Username is taken, try another' });
                } else {
                  collection.insert({username: params.userid, password: encrypt(params.password)},function(err, docs){});
                  sendJson(response, { msg: 'Registered!' });
                }
              });
            });
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

        case '/upload':
          if (request.method.toLowerCase() == 'post') {
            handleUpload(request, response);
          } else {
            jqserve(request,response,'404.html');
          }
          break;

        // for easy testing.
        // case '/demo':
        //   if (request.session.data.user == 'Guest') request.session.data.user = 'Guest-' + parseInt(Math.random() * 10000);
        //   jqserve(request, response, '/room.html', function(err, $) {
        //     if (err) console.log(err);
        //     var userid = $('<link/>').attr('id', 'userid')
        //                              .attr('userid', request.session.data.user);
        //     $('head').append(userid);
        //   });
        //   break;


        default:
          // need to serve chatrooms here if url is of form /*
          var hashstripped = parsed.pathname.substring(0, parsed.pathname.lastIndexOf('/#'));
          if (/^(\/)((?:[a-z][a-z0-9_]*))$/i.test(parsed.pathname)) {
            // console.log('user:',request.session.data.user);
            // console.log('history:',request.session.data.history);
            if (request.session.data.user === 'Guest') {
              redirectToRoom(response, request, '/login.html', 302);
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

function handleUpload (req, res) {
  // parse a file upload
  // var form = new formidable.IncomingForm();
  // form.parse(req, function(err, fields, files) {
  //   if (err) console.log(err);
  //   sendJson({fields: fields, files: files});
  // });
  sendJson(res, {fields: "Not Implemented", files: "Not Implemented"});
}

function sendJson(response, json) {
  console.dir(json);
  var text = JSON.stringify(json);
  response.writeHead(200, {'Content-Type':'application/json', 'Content-Length':text.length});
  response.end(text); // problem with sending this?
}

//
// THIS SHOULD REALLY USE BCRYPT
// https://github.com/ncb000gt/node.bcrypt.js
// Too bad bcrypt doesn't work on Solaris?
//
function encrypt(data) {
  return crypto.createHash('md5').update(data).digest("hex");
}
function redirect(res, req, location, status) {
  location = req.headers.host + location;
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
function redirectToRoom(res, req, location, status) {
  redirect(res, req, location + '?' + req.url, status);
}

httpServer.listen(PORT);

// Start server connection
mongo.open(function(p_client){});
var chatServer = require('./hakeru.js');
chatServer.listen(httpServer);
console.log('> server is listening on http://127.0.0.1:' + PORT + '/');
