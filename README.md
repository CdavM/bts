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
```localhost:3000```
Step VII. Deploy app to example.meteor.com (as long as it's available, it's free)
```meteor deploy example.meteor.com```
