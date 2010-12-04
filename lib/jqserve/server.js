// 
// Example of how to use jqserve with the built-in 
// node http server and nothing too fancy.
// 
var sys = require('sys')
  , url = require('url')
  , http = require('http')
  , querystring = require('querystring')
  , PORT = 8080
  , jqserve = require('./jqserve');

// Firin up our in-built node server
var httpServer = http.createServer(function (request, response) {

  request.body = '';
  request.addListener('data', function(chunk){ request.body += chunk; });

  // now that we have the whole request body, let's do stuff with it.
  request.addListener('end', function () {
    switch(request.url) {
      case '/':
        //
        // OMG MA SERVA IS TEMPLATIN WITH JQUERY!
        //
        jqserve(request, response, 'index.html', function(err, $) {
          
          // write jquery to your heart's content 
          $('.name').html('<b>David Trejo<b>');
          $('body').append($('<h1/>').text('CHECK THE FRIGGIN HTML FILE AND THIS SHIT WON\'T BE THERE!'))
                   .append('<a href="index.html">(see the static html file)');
          
        });
        break;

      default:
        // serve the file using node-static.
        jqserve(request, response);
        break;
    }
  });
});

httpServer.listen(PORT);
console.log('> server is listening on http://127.0.0.1:' + PORT);
