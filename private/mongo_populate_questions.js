/*mongo commands are:
meteor mongo btsturk.meteor.com
load("private/mongo_populate_questions.js")
*/
//Populate local arrays

var Cities = ["Los Angeles", "Portland", "Seattle", "Honolulu", "Birmingham"];
var States = ["California", "Oregon", "Washington", "Hawaii", "Alabama"];

//remove old questions
db.questions.remove();

//populate with new questions
for (i=0 ; i < Cities.length ; i++){
db.questions.insert({ text: Cities[i]+" is the capital of "+ States[i] , question_ID: i });
}

