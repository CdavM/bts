  Template.experiment.events({
  'click #begin_experiment': function (event) {
    worker_ID_value = Session.get("worker_ID_value");
    Session.set('initialized', true);
    Session.set('waiting', true);
    Meteor.call('initialPost', {worker_ID: worker_ID_value, initial_time: initial_time_val}, 'begin', function(error, result){
      if (error){
        console.log("error "+error);
      } else {
        initial_time_val = new Date().getTime();
      }
    });

  },

  'click #more_instructions': function (event) {
    window.open('/more_instructions');
  },

  'click #answer_submission': function(event) {
    var answer_value = {};
    var form = $("form").children();
    //for checkboxes, radio buttons
    form.filter("label").children().filter(":checked").each(function(index, element){
      //append the values to the answer array
      if (!answer_value[$(element)[0].form.name]){
        answer_value[$(element)[0].form.name]= [$(element).val()];
      } else {
        answer_value[$(element)[0].form.name].push($(element).val());
      }
    });
    //for the button
    if (event.target.parentNode.name){
      answer_value[event.target.parentNode.name] = event.target.value;
    }
    //for textares
    form.filter("textarea").each(function(index, element){
      if ($(element).val() != " "){
        if (!answer_value[$(element).parent().attr('name')]){
          answer_value[$(element).parent().attr('name')]= [$(element).val()];
        } else {
          answer_value[$(element).parent().attr('name')].push($(element).val());
        }
      }
    });
    if (Object.keys(answer_value).length != $("form").length){
      alert("Please make sure to answer every question.");
      return;
    }
    worker_ID_value = Session.get('worker_ID_value');
    answer_value['time'] = new Date().getTime() - initial_time_val; 
    Session.set("answered", true);
    Session.set("waiting", true);
    Meteor.call('newPost', {answer: answer_value, worker_ID: worker_ID_value}, function(error, result){
      if (error) {
        console.log("Error " + error + " occured. Please contact the administrators with the issue.");
      } else if (Answers.findOne({worker_ID: worker_ID_value}).experiment_finished){
        Session.set('experiment_finished', true);
        Router.go('/end');
        
      } else{
        Session.set('waiting', false);
      }
    });
  }

});
Template.experiment.helpers({
  questions: function() {
    worker_ID_value = Session.get('worker_ID_value');
    var curr_experiment = Answers.findOne({worker_ID: worker_ID_value});
    if (curr_experiment){
      //update average payment
      current_payment = curr_experiment.avg_payment;
      Session.set('current_payment', current_payment);
    }
    if (curr_experiment && (!Session.equals('current_question', curr_experiment.current_question))) {
      Session.set("current_question", curr_experiment.current_question);
      Session.set("waiting", false);
    } else {
      return Questions.find({question_ID: Session.get("current_question")});   
    }
  }
});
Template.question.helpers({
    comment1: function(index){
      var comment1 = ["com10","com11","com12"];
      return comment1[index];
    },
    comment2: function(index){
      var comment2 = ["com20","com21","com22","com23"];
      return comment2[index];
    }
});
