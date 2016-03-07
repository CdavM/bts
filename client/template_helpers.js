Template.registerHelper('worker_id_value',function(){
  if (Session.equals("worker_ID_value", -1)){
    return "BLANK";
  } else if (temp_worker_id) {
    return temp_worker_id;
  } else { 
    return Session.get('worker_ID_value');
  }
});  

Template.registerHelper('time_remaining', function(){return Session.get("time_remaining");});
Template.registerHelper('current_payment', function(){return Session.get('current_payment');});
Template.registerHelper('experiment_finished', function(){return Session.get('experiment_finished');});

Template.registerHelper('show_payment_system', function(){
  return Meteor.settings.public.show_payment; //show the user their current payment
});
Template.registerHelper('show_history', function(){
  return Meteor.settings.public.show_history; //show the user their past actions
});
Template.registerHelper('show_timer', function(){
  return Meteor.settings.public.show_timer; //show the user the time remaining
});


Template.registerHelper('initialized', function(){
  if (Session.equals('initialized', true)){
    return true;
  } else {
    return false;
  }
});

Template.registerHelper('current_answer', function(){
  var current_answer_value = Answers.findOne({worker_ID: Session.get("worker_ID_value")}).current_answer;
  return Meteor.settings.public.answer_forms[current_answer_value].template;
});

Template.registerHelper('waiting', function(){
  return Session.get('waiting');
});