//This code only executed on the server
//Kadira.connect('eh5MW5C97zHJup75Z', '5511d144-17a9-489e-af56-551a0d592371'); //performance benchmark


Meteor.publish("answers", function(){return Answers.find()});
Meteor.publish("questions", function(){return Questions.find()});
Solutions = new Mongo.Collection("solutions");
Meteor.publish("answerforms", function(){return AnswerForms.find()});
intervals = {};
counters = {};
timers = {};

threshold = Meteor.settings.threshold_workers; //we need at least threshold users in every experiment
experiment_id_counter = 1;

existing_experiment_counter = 0;
if (Answers.findOne({begin_experiment: true})){
  existing_experiment_counter = Answers.find({begin_experiment: true}, {sort: {experiment_id:-1}, limit:1}).fetch();
  experiment_id_counter = existing_experiment_counter[0].experiment_id + 1;
}

Meteor.startup(function(){
  //check and potentially update question database
  update_questions:{
    for(post in Meteor.settings.questions){
      if(!Questions.findOne(Meteor.settings.questions[post]) || Questions.find().count() != Meteor.settings.questions.length){
        console.log(Questions.findOne(Meteor.settings.questions[post]));
        console.log("Updating questionbank database");
        Questions.remove({});
        for(post in Meteor.settings.questions){
          Questions.insert(Meteor.settings.questions[post]);
        } 
        break update_questions;
      }
    }
  }
  //check and potentially update answer_forms
  
  update_answer_forms:{
    for(post in Meteor.settings.public.answer_forms){
      if(!AnswerForms.findOne(Meteor.settings.public.answer_forms[post]) || AnswerForms.find().count() != Meteor.settings.public.answer_forms.length){
        console.log("Updating answer form database"); 
        AnswerForms.remove({});
        for(post in Meteor.settings.public.answer_forms){
          AnswerForms.insert(Meteor.settings.public.answer_forms[post]);
        } 
        break update_answer_forms;
      }
    }
  }

});

Meteor.methods({
initialPost: function(post, status){
  //check if already present
  if (status == 'startup'){
    if (Answers.findOne({worker_ID: post.worker_ID})){
      return;
    }
    Answers.insert({worker_ID: post.worker_ID, asg_ID: post.asg_ID, initial_time: post.initial_time});
    return;
  } else {
    var num_of_questions = Questions.find().count();
    var random_number = Math.floor(Math.random() * num_of_questions);
    var experiment_id_value = experiment_id_counter;
    var begin_time_val = new Date().getTime();
    Answers.update({worker_ID: post.worker_ID}, {$set: {begin_time: begin_time_val, experiment_id: experiment_id_value,
                  avg_payment:0, experiment_finished:false}});
  }      

  if (counters[experiment_id_value]){
    counters[experiment_id_value]['initial_counter']++;
  } else {
    counters[experiment_id_value]={};
    counters[experiment_id_value]['initial_counter']=1;
    counters[experiment_id_value]['initial_timer']=true;
    //set timeout, also cancel a flag
    //TODO: implement automatic start
  }
  if (!counters[experiment_id_value]['random_counter']){
    counters[experiment_id_value]['random_counter'] = [];
  }


  if (counters[experiment_id_value]['initial_timer'] && counters[experiment_id_value]['initial_counter'] >= threshold){ //call this when we get two entries
    experiment_id_counter++;
    //var entries = Answers.find({experiment_id: experiment_id_value}).fetch();
    //console.log(post.worker_ID);
    Answers.update({experiment_id: experiment_id_value}, {$set:{begin_experiment: true}}, {upsert: true, multi: true});
    Meteor.call('beginQuestionScheduler', experiment_id_value);
    counters[experiment_id_value]['initial_timer']=false;
  }
  //return true;
},

newPost: function(post) {
  //format time to UTC human readable format
  post.initial_time = new Date(post.initial_time).toLocaleString();
  //var num_of_questions = Questions.find().count();

  var existing_entry = Answers.findOne({worker_ID: post.worker_ID});
  var answers_value = {};
  var experiment_id_value = existing_entry.experiment_id;

  if (existing_entry.answer1){
    //worker has submitted some answers, retrieve them
    answers_value = existing_entry.answer1;
  }
  var current_question = existing_entry.current_question;
  var current_answer = existing_entry.current_answer;
  //check if the user has answered the question already
  if (!answers_value[current_question]){
    answers_value[current_question] = {};
  }
  answers_value[current_question][current_answer] = post.answer;

  //Add entry to Answers
  Answers.update({worker_ID: post.worker_ID}, {$set: {answer1: answers_value}}, {upsert: true});

  //update question when we get ALL the answers
  
  if (counters[experiment_id_value][current_question]){
    counters[experiment_id_value][current_question]++;
  } else {
    counters[experiment_id_value][current_question]=1;
  }
  var num_of_workers = Meteor.settings.threshold_workers;
  
  if (counters[experiment_id_value][current_question] >= num_of_workers){


    Meteor.call('beginQuestionScheduler', experiment_id_value);
    
  }
  
  
},
submitFeedback: function(worker_ID_value, feedback_value){
  if (typeof worker_ID_value === 'undefined' || !worker_ID_value || typeof feedback_value === 'undefined' || !feedback_value){
    return;
  }
  Answers.update({worker_ID: worker_ID_value}, {$set:{feedback: feedback_value}}, {upsert:true});
  console.log("Feedback inserted for worker "+ worker_ID_value);
},

beginQuestionScheduler: function(experiment_id_value){
    //update questions every duration seconds
  var curr_experiment = Answers.findOne({experiment_id: experiment_id_value});
  var num_of_questions = Questions.find().count();
  update_question = function(experiment_id_value){
    var curr_experiment = Answers.findOne({experiment_id: experiment_id_value});
    if (!curr_experiment){
      console.log("experiment_id " + experiment_id_value + " not found in the database");
      return;
    }
    var num_of_questions = Questions.find().count();
    var selection_size = num_of_questions;
    if (Meteor.settings.questions_subset_size){
      selection_size = Math.min(num_of_questions,Meteor.settings.questions_subset_size);
    }
    if(Meteor.settings.randomize_questions){
      //generate random question
      do{
        var next_question = Math.floor(Math.random() * (num_of_questions));
      } while (counters[experiment_id_value]['random_counter'].indexOf(next_question) != -1 
      && counters[experiment_id_value]['random_counter'].length < selection_size)
    } else {
        var next_question = curr_experiment.current_question + 1;
    }
    if (counters[experiment_id_value]['random_counter'].length == selection_size){
      Meteor.clearInterval(intervals[experiment_id_value]);
      intervals[experiment_id_value]=0;
      Answers.update({experiment_id: experiment_id_value}, {$set:{experiment_finished: true, question_order: counters[experiment_id_value]['random_counter']}}, {upsert: true, multi: true});
      Meteor.setTimeout(function(){console.log("all questions passed for experiment " + experiment_id_value);},30);
    } else {
      //store result
      counters[experiment_id_value]['random_counter'][counters[experiment_id_value]['random_counter'].length]= next_question;
      Answers.update({experiment_id: experiment_id_value}, {$set: {current_question: next_question, current_answer: 0}}, {upsert: true, multi: true});
      console.log("question for experiment " + experiment_id_value + " changed to " + next_question);   
    }
    
  }

  decrease_time = function(experiment_id_value) {
    var curr_experiment = Answers.findOne({experiment_id: experiment_id_value});
    var curr_time = curr_experiment.timer;
    if (curr_time <= 0){
      Meteor.clearInterval(timers[experiment_id_value]);
      timers[experiment_id_value] = 0;
    } else {
      Answers.update({experiment_id: experiment_id_value}, {$set: {timer: curr_time-1}}, {upsert: true, multi: true});
    }
  }
  //always clear existing timers
  if (timers[experiment_id_value]){
    Meteor.clearInterval(timers[experiment_id_value]);
    timers[experiment_id_value] = 0;
  }
  if (intervals[experiment_id_value]){
    Meteor.clearTimeout(intervals[experiment_id_value]);
    intervals[experiment_id_value] = 0;
  }
  //always update timer
  var curr_answer_form = curr_experiment.current_answer; 
  if (curr_answer_form < Meteor.settings.public.answer_forms.length - 1){
    var next_answer_form = curr_answer_form + 1;
    Answers.update({experiment_id: experiment_id_value}, {$set: {current_answer: next_answer_form}}, {upsert:true, multi: true});
    counters[experiment_id_value][curr_experiment.current_question] = 0;
  } else {
    //updates the question

    //award the payment skupinsko
    
    var current_question = curr_experiment.current_question;
    // if realtime computation
    var entries = Answers.find({experiment_id: experiment_id_value}).fetch();
    // else sort answers by descending experiment id, with a limit of threshold, use that as entries.
    var answer_array = [];

    entries.forEach(function(post){
      answer_array[answer_array.length] = post.answer1;
    });
    if (current_question !== undefined){
      Meteor.call(Meteor.settings.payment_function, answer_array, current_question, function(error, result){
        if (error){
          console.log("Error " + error + " while processing the payment function");
        } else {
          entries.forEach(function(post, index){
            //break up the array, assign payments individually
            var payments_value = Answers.findOne({worker_ID: post.worker_ID}).payments;
            //var existing_payments = existing_entry.payments;
            if (!payments_value){
              //create new payments array
              var payments_value = [];
              for (i = 0; i < num_of_questions; i++) {
                payments_value[payments_value.length] = 0;
              }
            }
            payments_value[current_question] = result[index];
            var avg_payment_value = post.avg_payment + payments_value[current_question];  
            avg_payment_value = Math.round(avg_payment_value*1000)/1000;
            Answers.update({worker_ID: post.worker_ID}, {$set: {payments: payments_value,
              avg_payment: avg_payment_value}}, {upsert: true});
          })
        }
      });
    }

    update_question(experiment_id_value);
  }
  curr_experiment = Answers.findOne({experiment_id: experiment_id_value});
  var time_value = Meteor.settings.public.answer_forms[curr_experiment.current_answer].timer;
  if (time_value > 0 && !curr_experiment.experiment_finished){
    //initiate a countdown
    Answers.update({experiment_id: experiment_id_value}, {$set: {timer: time_value}}, {upsert:true, multi: true});
    timers[experiment_id_value] = Meteor.setInterval(function(){decrease_time(experiment_id_value);}, 1000);
    intervals[experiment_id_value] = Meteor.setTimeout(function(){Meteor.call('beginQuestionScheduler', experiment_id_value);}, time_value*1000);
  }
}

});
Meteor.methods({
payment: function(existing_entry){
  var num_of_questions = Questions.find().count();
  var current_question = existing_entry.current_question;
  var question_data = Questions.findOne({question_ID: current_question});
  var cat_solution = (question_data.prior_deck0 * question_data.deck0_opt0 * question_data.deck0_opt0 + question_data.prior_deck1 * question_data.deck1_opt0 * question_data.deck1_opt0)/
       (question_data.prior_deck0 * question_data.deck0_opt0 + question_data.prior_deck1 * question_data.deck1_opt0);
  var dog_solution = (question_data.prior_deck0 * question_data.deck0_opt1 * question_data.deck0_opt1 + question_data.prior_deck1 * question_data.deck1_opt1 * question_data.deck1_opt1)/
       (question_data.prior_deck0 * question_data.deck0_opt1 + question_data.prior_deck1 * question_data.deck1_opt1);

  
  var entries = Answers.find({experiment_id: existing_entry.experiment_id}).fetch();
  var num_of_workers = entries.length;
  //var solution_answer = Solutions.findOne().answer1[current_question];
  var payments_value = [];
  var existing_payments = existing_entry.payments;
  if (existing_payments){
    payments_value = existing_payments;
  } else { 
    //create new payments array
    for (i = 0; i < num_of_questions; i++) {
      payments_value[payments_value.length] = 0;
    }
  }

  var reward = 0;
  if (num_of_workers > 1){
    entries.forEach(function(post){
      if (post.worker_ID != existing_entry.worker_ID){
        if (!post.answer1 || post.answer1[current_question] == -1){
          reward = 0;
        } else if (post.answer1[current_question] == solution_answer){
          reward = 1;
        } else {
          reward = 0.3;
        }
      }
    });
  } else {
    entries.forEach(function(post){
      var distance;
      if (post.answer1[current_question].card_type == "Cat"){
        distance = Math.abs(Math.floor(parseInt(post.answer1[current_question].percentage_radio)/10) - (Math.ceil(cat_solution)-1));
      } else if (post.answer1[current_question].card_type == "Dog"){
        distance = Math.abs(Math.floor(parseInt(post.answer1[current_question].percentage_radio)/10) - (Math.ceil(dog_solution)-1));
      }
      if (distance == 0){
        reward = 8;
      } else if (distance == 1){
        reward = 5;
      } else if (distance == 2){
        reward = 2;
      } else {
        reward = 0;
      }
    });
  }
  payments_value[current_question] = reward;
  var avg_payment_value = existing_entry.avg_payment+payments_value[current_question];  
  avg_payment_value = Math.round(avg_payment_value*1000)/1000;
  Answers.update({worker_ID: existing_entry.worker_ID}, {$set: {payments: payments_value,
            avg_payment: avg_payment_value}}, {upsert: true});
},
payment123: function(answer_array, question_ID){
  var payment_temp = [];
  for (var i = 0; i < answer_array.length; i++) {
    payment_temp[i] = 0.04+i;
  };
  return payment_temp;
}
});