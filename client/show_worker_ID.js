Template.show_worker_ID.events({
  'click #proceed': function(event) {
    data = event.target.form[0].value;
    if ((!data || data == "") && temp_worker_id == -1) {
      alert("Please enter your Worker ID");
      return;
    } else if (data && data != ""){
      temp_worker_id = data;
    }
    //check if the user has participated already
    curr_exp = Answers.findOne({worker_ID: temp_worker_id});
    if (curr_exp){
      alert("Our records indicate that you have already participated in the survey. Thank you!");
      return;
    } else {
      Session.set('worker_ID_value', temp_worker_id);
      Router.go('/experiment');
    }
  }
});