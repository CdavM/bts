
// This code only runs on the client
Meteor.subscribe("answers"); 
Meteor.subscribe("questions"); // get questionbank
Meteor.subscribe("answerforms"); //get answer forms
Session.set("answered", false);
Session.set("time_remaining", duration/1000);
Session.set('current_payment', 0);
Session.set('payment_sum', 0);
Session.set('experiment_finished', false);
Session.set('current_question', 0);
Session.set('current_answer', 0);
Session.set('show_answer', true);
Session.set('waiting', true);
initialized_questions = true;

var history_data_temp = [];

for (var i = 0; i < Meteor.settings.public.history_duration; i++) {
  history_data_temp[i]={};
  if (i == 0){
    history_data_temp[i]["Title"] = "Last question";
  } else {
    history_data_temp[i]["Title"] = (i+1) + " questions ago";
  }
  for (var j = 0; j < Meteor.settings.public.history_fields.length; j++) {
    history_data_temp[i][Meteor.settings.public.history_fields[j]] = "-";
  }
};
Session.set('history_data', history_data_temp);
initialized_questions = true;
temp_worker_id = -1;
// disables 'enter' key
$(document).on("keypress", 'form', function (e) {
  var code = e.keyCode || e.which;
  if (code == 13) {
      e.preventDefault();
      return false;
  }
});

//reactively starts the experiment
Deps.autorun(function(){
  var curr_experiment = Answers.findOne({worker_ID: Session.get('worker_ID_value')}, {fields: {begin_experiment:1, timer:1, current_answer: 1}});
  if (initialized_questions && curr_experiment && curr_experiment.begin_experiment){
    console.log("new experiment entry inserted for worker " + Session.get('worker_ID_value'));
    Session.set('initialized', true);
    Session.set('waiting', false);
    initialized_questions = false;
    $('#exp_start').ScrollTo();  
  }

  if (curr_experiment && !Session.equals('current_answer', curr_experiment.current_answer)){  
    Session.set('current_answer', curr_experiment.current_answer);
    Session.set('current_question', curr_experiment.current_question);
    Session.set('show_answer', true);
    Session.set('waiting', false);
    Session.set("answered", false);  
  }
  if (curr_experiment && !Session.equals('time_remaining', curr_experiment.timer)) {
    Session.set('time_remaining', curr_experiment.timer);
    if (curr_experiment.timer == 0){
      Session.set('show_answer', false);
      update_history();
    }
  }
});