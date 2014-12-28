/*mongo commands are:
meteor mongo btsturk.meteor.com
load("private/mongo_populate_questions.js")
*/
//Populate local arrays

Cities = ["Los Angeles", "Portland", "Seattle", "Honolulu", "Birmingham"];
States = ["California", "Oregon", "Washington", "Hawaii", "Alabama"];

//remove old questions
db.questions.remove();

//populate with new questions
for (i=0 ; i < Cities.length ; i++){
	db.questions.insert({ text: Cities[i]+" is the capital of "+ States[i] , question_ID: i });
}
//remove old solutions
db.solutions.remove();
//populate with new solutions
db.solutions.insert({answer1:[0,0,0,1,0]});