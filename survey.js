// rsync -az /media/coding/survey/ survey/

Answers = new Mongo.Collection("answers");
Questions = new Mongo.Collection("questions");

if (Meteor.isClient) {
  // This code only runs on the client
  var initial_time_val = new Date().getTime();
  //Meteor.subscribe("answers");
  Meteor.subscribe("questions"); // get questionbank

  // disables 'enter' key
  $(document).on("keypress", 'form', function (e) {
    var code = e.keyCode || e.which;
    if (code == 13) {
        e.preventDefault();
        return false;
    }
  });

  Template.body.helpers({
    questions: function() {
      return Questions.find();
    } 
  });

  Template.body.events({
  'click .final_submission': function (event) {
    //TODO: if worker_ID present in our database, do not let him re-take the survey
    console.log("inserting step I");
    var num_of_questions = Questions.find().count();
    event.preventDefault();
    var answers = [];
    if (!document.getElementsByName("toggle-checked-ID")[0].checked){
      alert("Please confirm your Worker_ID before proceeding.");
      return;
    }
    for (var i = 0; i < num_of_questions; i++) {
      if(!(document.getElementsByName(i)[0].checked || document.getElementsByName(i)[1].checked)){
        alert("You did not answer all the questions. Please answer the remaining questions before submitting.");
        return;
      }
      answers[answers.length] = document.getElementsByName(i)[0].checked;
    }
    var time_difference_val = new Date().getTime();
    time_difference_val -= initial_time_val;
    var worker_ID_value = document.getElementsByName("worker_ID")[0].value;
    console.log(answers[0] + " " + answers[1] + " " + answers[2]);
    Meteor.call('newPost', {answer1: answers, worker_ID: worker_ID_value, initial_time: initial_time_val,
     time_difference: time_difference_val}, function (error, result) {
      if (error) {
        // handle error
        unique_id = error;
        alert("Sorry, an error occured. Please contact the requestor and let him know. Here is the error code: " + return1);
      } else {
        // examine result
        unique_id = result;
        alert("Thank you! Please copy and paste the following to the MTurk interface to complete the HIT: " + unique_id);
      }
    });
    
  }
  });
}

if (Meteor.isServer) {
  //This code only executed on the server

Meteor.methods({
  newPost: function(post) {
    console.log(post.worker_ID);
    //format time to PST human readable format
    post.initial_time = new Date(post.initial_time).toLocaleString();
    console.log(post.initial_time);
    if (Answers.find({worker_ID: post.worker_ID}).count() > 0) {
      console.log("removing previous entry");
      Answers.remove({worker_ID: post.worker_ID});
    }
    Answers.insert(post);
    console.log("now actually inserting");
    var return_ID = Answers.findOne({worker_ID: post.worker_ID})._id;
    console.log(return_ID);
    return return_ID;
    //Meteor.publish("answers");
  }
})
}