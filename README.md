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

h2. How to get the dev server running! (does not yet fully duplicate production, but in any case):

Clone this repository using like this*:
<pre>git clone git@github.com:DTrejo/hakeru.git</pre>

make sure you have "mongodb installed":http://www.mongodb.org/downloads, or just "sudo port install mongodb." Make sure you follow the "quickstart guide":http://www.mongodb.org/display/DOCS/Quickstart for your OS. For mac you'd run:
<pre>mkdir -p /data/db</pre>
  
Also get the node code ("install npm":http://github.com/isaacs/npm, or "install it along with node":http://gist.github.com/579814):
<pre>cd hakeru/
npm install
</pre>
  
h2. Now that you have all the dependencies, you should be able to start up the server:

<pre>cd hakeru/
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

h2. troubleshooting

I'm missing a module!
* Do a ctrl-f <code>npm</code> and make sure you've installed everything in this guide

I have an error!
* email david or call him, make sure to have the stack trace on hand


h2. installation on no.de

install mongo

run mongo with --dbpath option, so no root needed

symlink to latest node

install specific npm packages needed by the code.

ugh annoying.