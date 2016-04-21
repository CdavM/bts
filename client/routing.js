Router.route('/', function(){
if (Session.equals('worker_ID_value', -1) || ! Session.get('worker_ID_value')){
  //if no worker_ID found redirect back to starting page
  //worker_ID randomly generated for easier debugging
  Router.go('/WID='+makeid()+'&ASG='+makeid());
  //Router.go('/end');
  } else {
    this.render('experiment');
  }
});

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

Router.route('/WID=:wid&ASG=:asg', function(){
  var wid = this.params.wid;
  var asg_val = this.params.asg;
  var curr_experiment = Answers.findOne({worker_ID: wid});
  Session.set('worker_ID_value', wid);
  if (curr_experiment && curr_experiment.experiment_finished){
    //Meteor.setTimeout(function(){Session.set('experiment_finished', false);}, 150);
    Router.go('/end');  //send them to end, entry participated already.
  } else {
    initial_time_val = new Date().getTime();
    Meteor.call('initialPost', {worker_ID: wid, initial_time: initial_time_val, asg_ID: asg_val}, 'startup');
    this.render('experiment');
  }
});

Router.route('/end', function(){
  this.render('end');
});

Router.route('/more_instructions', function(){
  this.render('more_instructions');
});