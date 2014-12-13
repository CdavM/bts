Step I. Install Node.js (this step may or may not be optional)

https://github.com/joyent/node/wiki/installing-node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions

Step II. Install Meteor
```
curl https://install.meteor.com/ | sh
```
Step III. Create new Meteor app
```
meteor create survey
cd survey
```
Step IV. Copy files from GitHub into folder
Step V. Run app. From the survey directory, run:
```
meteor
```
Step VI. Visit the app at
```
http://localhost:3000
```
Step VII. Now the app should be running, but there are no questions in the questionbank. To get access to the mongo database run the following in a new terminal:
```
meteor mongo
```
Step VIII. Populate the database with the questions by running this from within the mongo shell:
```
load("private/mongo_populate_questions.js")
```
Step IX. I recommend looking through Meteor and Mongo documentations. We have a questions database, populated with questions and an answers database, where answers get stored. To see all the current answers, run the following from the mongo shell: (note: if it is empty try filling out the survey a couple of times)
```
db.answers.find()
```
Final Step. Deploy app to example.meteor.com (as long as it's available, it's free)
```
meteor deploy example.meteor.com
```

