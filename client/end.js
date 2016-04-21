Template.end.events({
  'click #feedback_submission': function(event){
    var feedback_value = document.getElementsByName("feedback")[0].value;
    Meteor.call('submitFeedback', Session.get("worker_ID_value"), feedback_value, function(error, result){
      if (error){
        alert("The following error occured while processing your request" + error);
      } else {
        alert("Thank you for your feedback, we appreciate it!");
        $("#feedback_complete").hide();      
      }
    });
  }
});