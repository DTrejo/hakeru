<pre>
      ___           ___           ___           ___           ___           ___     
     /__/\         /  /\         /__/|         /  /\         /  /\         /__/\    
     \  \:\       /  /::\       |  |:|        /  /:/_       /  /::\        \  \:\   
      \__\:\     /  /:/\:\      |  |:|       /  /:/ /\     /  /:/\:\        \  \:\  
  ___ /  /::\   /  /:/~/::\   __|  |:|      /  /:/ /:/_   /  /:/~/:/    ___  \  \:\ 
 /__/\  /:/\:\ /__/:/ /:/\:\ /__/\_|:|____ /__/:/ /:/ /\ /__/:/ /:/___ /__/\  \__\:\
 \  \:\/:/__\/ \  \:\/:/__\/ \  \:\/:::::/ \  \:\/:/ /:/ \  \:\/:::::/ \  \:\ /  /:/
  \  \::/       \  \::/       \  \::/~~~~   \  \::/ /:/   \  \::/~~~~   \  \:\  /:/ 
   \  \:\        \  \:\        \  \:\        \  \:\/:/     \  \:\        \  \:\/:/  
    \  \:\        \  \:\        \  \:\        \  \::/       \  \:\        \  \::/   
     \__\/         \__\/         \__\/         \__\/         \__\/         \__\/
</pre>

 
h2. Protips:

Hakeru's production Node server is dtrejo.no.de

In order to push your changes to prod you must

# Get your Joyent account added by Eric to eric.no.de, then
  <pre> git remote add joyent ssh://node@eric.no.de/repo
git push joyent master</pre>
# Server is now magically running
# ssh node@eric.no.de and node-service-log to see errors

We don't have a dev server yet, so everything has to go to prod

h2. How to get the dev server running! (does not yet fully duplicate production, but in any case):

Clone this repository using like this*:
<pre>git clone --recursive git@github.com:3wt/Hakeru-Backend-Server.git</pre>

if you've already cloned, but forgot to do the above, run this:
<pre>git submodule update --init</pre>
  
make sure you have "mongodb installed":http://www.mongodb.org/downloads, or just "sudo port install mongodb." Make sure you follow the "quickstart guide":http://www.mongodb.org/display/DOCS/Quickstart for your OS. For mac you'd run:
<pre>mkdir -p /data/db</pre>
  
Also get the node code ("install npm":http://github.com/isaacs/npm, or "install it along with node":http://gist.github.com/579814):
<pre>npm install mongodb node-static@0.5.2 socket.io mongodb sesh formidable</pre>
  
h2. Now that you have all the dependencies, you should be able to start up the server:

<pre>cd Hakeru-Backend-Server
mongod
sudo node server.js</pre>

the server should now be running at "http://localhost/":http://localhost/
all done! Develop to your heart's content.
  
h2. Things that need attention:
* registration
* upload
* clean up the existing code, especially in the chatserver. indentation, variable naming, classes in different files.
* make url routing more robust. Use a routing module?
* server dies if mongod not running — add a try-catch and display something helpful, like could not connect to DB. This way already-running rooms will stay up even if server dies.
* √ demo room: "eric.no.de/demo":http://eric.no.de/demo
* √ sessions
* √ eric.no.de/* url routing works
* √ chat rooms work
* √ html5 notifications work


*to learn all about submodules, this is a good start http://longair.net/blog/2010/06/02/git-submodules-explained/

h2. troubleshooting

I'm missing a module!
* Do a ctrl-f <code>npm</code> and make sure you've installed everything in this guide

There are empty folders that should not be empty!
* do a <code>git submodule update --init</code>

I have an error!
* email david or call him, make sure to have the stack trace on hand


h2. installation on no.de

install mongo

run mongo with --dbpath option, so no root needed

symlink to latest node

install specific npm packages needed by the code.

ugh annoying.