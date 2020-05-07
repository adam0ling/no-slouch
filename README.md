# Simple Slouching app

You can try out this application here: https://slouchshout.herokuapp.com/

This application should prevent you from slouching while sitting at a desk.

Basic instructions:
* When the app loads up you should see a greeting header, camera box and 3 buttons. If you do not see the camera box you need to allow camera access in your browser, or connect the camera itself :D.
* There are 3 buttons - Straight, Slouched and Start.
* Press and hold Straight button while sitting straight. Lean to each side with your body and head to get multiple different examples. Release the button when done.
* Press and hold Slouched button while sitting slouched. Lean to each side with your body and head to get multiple different examples. Release the button when done.
* Around a 100 examples is a good sample for each class.
* Click Start when ready.
* After clicking start the app will start calculating Score. If you are near a 100 - you are sitting straight, if below 20 - you have been slouched for a while and the app will start playing a sound to notify you.

This is example application is built using a boiler plate from googlecreativelab: https://github.com/googlecreativelab/teachable-machine-boilerplate

It uses tensorflow js library to use deep learning in JS: https://www.tensorflow.org/js

Changes made to the boilerplate:
* Sample addition and classes limited to 2
* Added score counter and sound notifications
* Design changes

# How to make your own

1. Decide how many classes you want. Should the number be flexible or not. 
2. Decide on any additional features you want to add. Like sound notification, score calculator or anything else.
3. Clone boilerplate repository.
4. In ./main.js Fix the number of classes first and test out your application. Follow the instructions in the boiler plate repo to run it. 
5. Check how your additional features should be implemented. If they should be called when reaching a specific score or when some class is guessed check <async animate()> in ./main.js for that. 
6. As for the design I'm quite bad with front end and just used some formating calls on buttons and Divs themselves and miligram CSS framework. Check my index.html and https://milligram.io/ for more info. 
7. That's pretty much it. You should have a nicely working deeplearning application which you can now deploy to the interwebs.

# How to deploy

For deployment example I use heroku (https://heroku.com/) as it's free and quite widely known.

So you have your app working and looking as you want it to look. Great. To deploy it we'll need to make a couple of changes.

1. In package.json if you would compare mine to the original in boilerplate you'll see that most of devDependencies are now moved to dependencies. All dependecies you use in your application should be there.
2. Additionally you need to make server.js file. It's a template script so you can just copy mine. Note that heroku assigns a port to appliaction, meaning you should not assign a static port for it to listen to, thus, this line <const PORT = process.env.PORT || 3000;>
3. When you have your serves.js sorted out check if it works by running <node server.js> in your application directory.
4. If that works - great! There's just a couple of changes we need to do to the package.json file now. In scripts section of code you need to:
* change this line: <"start": "budo main.js:dist/build.js --live --host localhost",> with this <"start": "node server.js",>
* add aditional line <"heroku-postbuild": "npm run build">
5. You are pretty much done. All you need to do now is head to https://heroku.com/ and deploy your appliaction. There are two main waays to do it. Either with heroku cli or using github connection. If you want a fast and easy way use gihub connection and just make a repository for you app and deploy that.

!!! IMPORTANT !!! Your repository should not contain node_modules directory but should have package-lock.json

Hopefully you were successful with the whole building and deploying thing and have a nice little deeplearning example app built using tensorflow js and googlecreativelab boilerplate. Gratz!

