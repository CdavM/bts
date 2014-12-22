// rsync -az /media/coding/survey/ survey/

Answers = new Mongo.Collection("answers");
Questions = new Mongo.Collection("questions");
//Experiment = new Mongo.Collection("experiment");
duration = 10000; //ms

if (Meteor.isClient) {
  // This code only runs on the client
  var initial_time_val = new Date().getTime();
  Session.set("answered", false);
  Session.set("time_remaining", duration/1000);
  Session.set('duration', duration/1000);
  Session.set('current_payment', 0);
  Session.set('payment_sum', 0);
  Session.set('experiment_finished', false);
  Session.set('current_question', 0);

  Meteor.subscribe("answers"); 
  Meteor.subscribe("questions"); // get questionbank

  // disables 'enter' key
  $(document).on("keypress", 'form', function (e) {
    var code = e.keyCode || e.which;
    if (code == 13) {
        e.preventDefault();
        return false;
    }
  });

  Handlebars.registerHelper('question_background',function(){
    if (Session.get("answered") && Session.get("answered") == true){
      return "answered";
    } else {
      return "unanswered";
    }
  });
  Handlebars.registerHelper('time_remaining', function(){return Session.get("time_remaining");});
  Handlebars.registerHelper('duration', function(){return Session.get('duration');});
  Handlebars.registerHelper('current_payment', function(){return Session.get('current_payment');});

  Handlebars.registerHelper('display_worker_form', function(){
    if (Session.get('initialized') && Session.get('initialized')==true ){
      return "invisible";
    } else {
      return "";
    }
  });
  Handlebars.registerHelper('initialized', function(){
    if (Session.get('initialized') && Session.get('initialized')==true ){
      return true;
    } else {
      return false;
    }
  });

  decrease_time = function() {
    curr_time = Session.get("time_remaining");
    if (curr_time <= 0){
      Meteor.clearInterval(countdown);
    } else {
      Session.set("time_remaining", curr_time-1);
    }
    
  }

  Template.body.helpers({
    questions: function() {
      worker_ID_value = document.getElementsByName("worker_ID")[0].value;
      var curr_experiment = Answers.findOne({experiment_id: 1, worker_ID: worker_ID_value});
      if (curr_experiment && (curr_experiment.current_question != Session.get('current_question'))) {
        Session.set("current_question", curr_experiment.current_question);
        Session.set("answered", false);
        Session.set("time_remaining", duration/1000);
      } if (curr_experiment && curr_experiment.experiment_finished == true) {
        alert("You have finished the experiment. Please return to MTurk and confirm your participation there. Thank you for your help!");
        return;
      }
        return Questions.find({question_ID: Session.get("current_question")});   
      }
  });


  Template.body.events({

  'click .begin_experiment': function (event) {
    worker_ID_value = document.getElementsByName("worker_ID")[0].value;
    if (worker_ID_value == ""){
      alert("Please enter your Worker ID");
      return;
    }
    //find experiment state for the worker
    curr_exp = Answers.findOne({worker_ID: worker_ID_value});
    if (!curr_exp){
      Meteor.call('initialPost', {worker_ID: worker_ID_value, experiment_id:1, current_question:0, experiment_finished:false});
      console.log("new experiment entry inserted for worker " + worker_ID_value);
      Meteor.call('beginExperiment', worker_ID_value, function(error, result){
        if (error){
          //handle error
          alert("Sorry, an error occured. Please contact the requestor with this error code: " + error);
        }
      });
      Session.set('initialized', true);
      Session.set('worker_ID_value', worker_ID_value);
      countdown = Meteor.setInterval(decrease_time, 1000);
    } else {
      alert("Our records indicate that you have already participated in the survey. Thank you!");
    }
  },

  'click .answer_submission': function (event) {
    Session.set("answered", true);
        
    num_of_questions = Questions.find().count();
    worker_ID_value = Session.get('worker_ID_value');

    existing_entry = Answers.findOne({worker_ID: worker_ID_value});
    answers_value = [];


    if (existing_entry && existing_entry.answer1){
      //worker has submitted some answers, retrieve them
      answers_value = existing_entry.answer1;
    } else {
      //no answers submitted yet, construct empty array
      for (i = 0; i < num_of_questions; i++) {
        answers_value[answers_value.length] = "None";
      }
    }
    current_question = Session.get("current_question");
    
    if(!(document.getElementsByName(current_question)[0].checked 
        || document.getElementsByName(current_question)[1].checked)){
      alert("You did not answer the question. Please answer the question before submitting your answer.");
      return;
    } else {
      if(document.getElementsByName(current_question)[0].checked){
        //1 is TRUE, 0 is FALSE
        answers_value[current_question] = 1;
      } else {
        answers_value[current_question] = 0;
      } 
    }

    time_difference_val = new Date().getTime();
    time_difference_val -= initial_time_val;
    Meteor.call('newPost', {answer1: answers_value, worker_ID: worker_ID_value, initial_time: initial_time_val,
     time_difference: time_difference_val}, function (error, result) {
      if (error) {
        // handle error
        alert("Sorry, an error occured. Please contact the requestor with this error code: " + error);
      } else {
        // examine result
        Session.set('payment_sum', Session.get('payment_sum') + result);
        current_payment = Session.get('payment_sum')/(current_question+1)
        Session.set('current_payment', Math.round(current_payment*1000)/1000);
        //process average payment
        console.log("payment for the current question is "+ result);
                
      }
    });
    
  }
  });
}

if (Meteor.isServer) {
  //This code only executed on the server
  Meteor.publish("answers", function(){return Answers.find()});
  Meteor.publish("questions", function(){return Questions.find()});
  Solutions = new Mongo.Collection("solutions");


Meteor.methods({
  initialPost: function(post){
    Answers.insert(post);
  },
  newPost: function(post) {
    //format time to UTC human readable format
    post.initial_time = new Date(post.initial_time).toLocaleString();
    var num_of_questions = Questions.find().count();
    //award a payment
    current_question = Answers.findOne({worker_ID: post.worker_ID}).current_question;
    current_answer = post.answer1[current_question];
    solution_answer = Solutions.findOne().answer1[current_question];
    reward = 0;
    if (current_answer == solution_answer){
      reward = 1;
    } else {
      reward = 0.3;
    }
    payments_value = [];
    existing_payments = Answers.findOne({worker_ID: post.worker_ID}).payments;
    if (existing_payments){
      payments_value = existing_payments;
    } else {
      for (i = 0; i < num_of_questions; i++) {
        payments_value[payments_value.length] = 0;
      }
    }
    payments_value[current_question] = reward;
    //Add entry to Answers
    Answers.update({worker_ID: post.worker_ID}, {$set: {answer1: post.answer1, payments: post.payments, 
      initial_time: post.initial_time, time_difference: post.time_difference,
       payments: payments_value}}, {upsert: true});
    return reward;
  },

  beginExperiment: function(worker_ID_value){
      //update questions every duration seconds
    update_question = function(worker_ID_value){
      curr_experiment = Answers.findOne({experiment_id: 1, worker_ID: worker_ID_value});
      if (curr_experiment){
        current_question = curr_experiment.current_question;
        num_of_questions = Questions.find().count();

        if (current_question == (num_of_questions - 1) ){
          Meteor.clearInterval(update);
          Answers.update({worker_ID:worker_ID_value}, {$set:{experiment_finished: true}}, {upsert: true});
          console.log("all the questions passed for " + worker_ID_value);
          return false;
        } else {
          next_question = current_question + 1;
          Answers.update({experiment_id: 1, worker_ID: worker_ID_value}, {$set: {current_question: next_question}});
          console.log("question for " + worker_ID_value + " changed to " + next_question);
          return true;
        }
      }
    }
    //argument in setInterval must be a function, remember that function(argument) evaluates to a value
    update = Meteor.setInterval(function(){update_question(worker_ID_value);}, duration);
    
  }
})
}