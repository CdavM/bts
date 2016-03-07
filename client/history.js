Template.history_table.helpers({
  history_data: function(argument) {
    console.log(argument);
    //return argument;
    var history_dictionary = Session.get('history_data'); //random dependancy
    console.log(history_dictionary);
    return history_dictionary;
  },
  history_titles: function(){
    return Meteor.settings.public.history_fields;
  },
  hist_data: function(){
    console.log("this is ");
    console.log(this);
    return this;
  }
});
update_history = function(){
  worker_ID_value = Session.get('worker_ID_value');
  var curr_experiment = Answers.findOne({worker_ID: worker_ID_value});
  if (!curr_experiment){return;}
  var answers_value = curr_experiment.answer1;
  var percentages_value = curr_experiment.percentages;
  var payments_value = curr_experiment.payments;
  if (!answers_value || !percentages_value) {return;}
  var current_question = curr_experiment.current_question; //
  var history_length=3;
  var temp_title = "";
  var history_dictionary = Session.get('history_data');
  for (var i=history_length; i>0; i--){
    temp_title = history_dictionary[i].Title;
    history_dictionary[i] = jQuery.extend({},history_dictionary[i-1]);
    history_dictionary[i].Title = temp_title;
  }
  var answer_value;
  var percentage_value;
  if (!answers_value || answers_value[current_question] == -1){
    answer_value = "None";
  } else if (answers_value[current_question] == 1){
    answer_value = "True";
  } else if (answers_value[current_question] == 0){
    answer_value = "False";
  }
  if (!percentages_value || percentages_value[current_question] == -1){
    percentage_value = "None";
  } else {
    percentage_value = percentages_value[current_question]*10 + "-" + (percentages_value[current_question]*10+10);
  }
  history_dictionary[0] = {Title:'last question', Answer: answer_value,
   Percentage: percentage_value, Payment: payments_value[current_question]};
  Session.set('history_data', history_dictionary);
};
