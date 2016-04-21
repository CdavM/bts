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
    istable: function(text){
      if (text.substring(0,6) == "In gen"){
        return true;
      } else {
        return false;
      }
    },
    isgradea: function(grade){
      if (grade == "an A"){
        return true;
      } else {
        return false;
      }
    },
    ismechrf: function(text){
      if (text.substring(10,11) == "5")
        return true;
      return false;
    },
    formula: function(){


    worker_ID_value = Session.get('worker_ID_value');
    var curr_experiment = Answers.findOne({worker_ID: worker_ID_value});
    var curr_q = curr_experiment.current_question;
    //co
    if (typeof curr_q != 'undefined'){
      /*if (curr_q == 0 || curr_q == 10){
        //mech 1A
        return ["If two graders who grade an essay give it the same grade, then they get a reward of $\\$1$, otherwise they get nothing."];
      } else if (curr_q == 1 || curr_q == 11){
        //mech 1B
        return ["If two graders who grade an essay give it different grades, then they get a reward of $\\$1$, else if they give it the same grade, they get nothing."];
      } else */ if (curr_q == 0 || curr_q == 4){
        //mech 2A
        return ["Suppose that Lisa is grading the same essay as Sam.  Let's see what reward Sam gets.  First, he gets $\\$1$ as \
        a starting reward. Then he may also get a bonus reward. How much? That depends. If he and Lisa give different grades (e.g., Sam gives an A and Lisa \
        gives a B), then Sam gets no bonus. However, if he and Lisa give the same grade, then he will get a bonus that depends on how popular \
        the grade is overall. Higher the popularity, lower the bonus.", "In general, if x% of the class got an \
        A and y% got a B (of course, x+y must add up to 100) then Sam's bonus for the different possibilities is given in the table below.","For example, if 40% of the grades were A and 60% B, and if Lisa and Sam both give A, \
        then Sam gets a bonus of $\\$2.5$, but if both give a B, then their bonus is only $\\$1.67$ since B is more popular."];

        /*return ["Suppose that Lisa is grading the same essay as Sam. First, Sam is given a base reward of $\\$1$ for his effort. Then if both Sam and Lisa give the essay an A, then Sam gets a bonus of","${\\dfrac{1}{\\mathsf{Percentage\\ of\\ A\\ grades\\ amongst\\ all\\ the\\ grades\\ given\\ by\\ the\\ class }}}$", "and if both of them give it a B, then Sam gets a bonus of",
         "${\\dfrac{1}{\\mathsf{Percentage\\ of\\ B\\ grades\\ amongst\\ all\\ the\\ grades\\ given\\ by\\ the\\ class }}}$",
         "Thus higher the percentage of a particular grade, lower is the agreement bonus for that grade.","If Sam and Lisa give different grades then he doesn’t get any bonus."];*/
      } else if (curr_q == 1 || curr_q == 5){
        //mech 2B
        return ["Suppose that Lisa is grading the same essay as Sam.  Let's see what reward Sam gets.  First, he gets $\\$1$ as \
        a starting reward. But then Sam may have to pay a penalty. How much? That depends. If he and Lisa give different grades (e.g., Sam gives an A and Lisa \
        gives a B), then Sam pays nothing. However, if he and Lisa give the same grade, then he will pay a penalty that depends on how popular \
        the grade is overall. Higher the popularity, lower the penalty.", "In general, if x% of the class got an \
        A and y% got a B (of course, x+y must add up to 100) then Sam's penalty for the different possibilities is given in the table below.","For example, if 40% of the grades were A and 60% B, and if Lisa and Sam both give A, \
        then Sam gets a penalty of $\\$2.5$, but if both give a B, then their penalty is only $\\$1.67$ since B is more popular."];
      } /* else if (curr_q == 4 || curr_q == 14){
        //mech 3A
        return ["First, all the graders are given a base reward of $\\$1$ for their effort. They further receive a bonus, which is computed as follows. If any two graders who grade an essay both give it an A,\
         then each of them gets a bonus of RA dollars and if both of them give it a B, then each of them gets a bonus of RB dollars, where",
         "RA= 1/Square root of the percentage of essays that get an A from both graders", "RB= 1/ Square root of the percentage of essays that get an B from both graders", 
         "Note that if a number Y is such that Y times Y is a number X, then Y is called the square root of X.  If a number is large, its square root is large as well.",
         "Thus higher the percentage of essays that get a particular grade from both its graders, lower is the agreement bonus for that grade.", 
         "If the two graders give different grades they don’t get any bonus."];
      } else if (curr_q == 5 || curr_q == 15){
        //mech 3B
        return ["First, all the graders are given a base reward of $\\$1$ for their effort. But then a penalty is deducted from this amount in the following way.\
        If both of the graders who grade an essay give it an A, then each of them pays a penalty of PA dollars, and if both of them give it a B, then each of them pays a penalty of PB dollars, where",
          "PA= 1/Square root of the percentage of essays that get an A from both graders", "PB= 1/ Square root of the percentage of essays that get an B from both graders",
          "Note that if a number Y is such that Y times Y is a number X, then Y is called the square root of X.  If a number is large, its square root is large as well.",
          "Thus higher the percentage of essays that get a particular grade from both its graders, lower is the agreement penalty for that grade.","If the two graders give different grades they don’t pay any penalty."];
      } else if (curr_q == 6 || curr_q == 16){
        //mech 4A
        return ["Sam’s reward is calculated as follows. First another grader who has graded a different essay is randomly chosen. Then if Lisa and the\
         other grader have given the same grade, then Sam gets $\\$1$ irrespective of what grade he has given. If Lisa and the other grader have given\
         different grades, then if Sam’s grade is same as Lisa’s grade he gets $\\$2$, else if Sam’s grade is same as the other grader’s grade then he gets nothing.",
        ];
      } else if (curr_q == 7 || curr_q == 17){
        //mech 4B
        return ["Sam’s reward is calculated as follows. First another grader who has graded a different essay is randomly chosen. Then if Lisa and the\
         other grader have given the same grade, then Sam gets $\\$1$ irrespective of what grade he has given. If Lisa and the other grader have given\
          different grades, then if Sam’s grade is same as Lisa’s grade he gets nothing, else if Sam’s grade is same as the other grader’s grade then he gets $\\$2$."];
      } */ else if (curr_q == 2 || curr_q == 6){
        //mech 5A
        return ["Since every essay is graded by two people, we will call those two students partners. Suppose that Lisa is Sam's partner. First, for every other essay, one of the two graders that have evaluated it is chosen to form a collection of graders. If all the grades given by this collection do not have 2 As and 2 Bs, then Sam does not get any reward and the scheme ends.",
        "If they have 2 As and 2 Bs, then choose two graders from this collection who gave the same grade to their essays as Sam. Suppose these graders are Bob and Mike. Let Bob’s partner be Alice and let Mike’s partner be Nicole.",
        "Sam is then rewarded as follows  :", "He gets a starting reward of $0.50.", "He gets a bonus of $1 if Lisa’s grade is same as Alice’s.",
        "But then he pays a penalty of $0.5 if Alice’s grade is same as Nicole’s.","For instance, if Sam gives an B, while Lisa, Nicole and Alice give an A, Sam would receive a total reward of $0.5+1-0.5=\\$1$."];
      } else if (curr_q == 3 || curr_q == 7){
        //mech 5B
        return ["Since every essay is graded by two people, we will call those two students partners. Suppose that Lisa is Sam's partner. First, for every other essay, one of the two graders that have evaluated it is chosen to form a collection of graders. If all the grades given by this collection do not have 2 As and 2 Bs, then Sam gets a total reward of $1.5 and the scheme ends.",
        "If they have 2 As and 2 Bs, then choose two graders from this collection who gave the same grade to their essays as Sam. Suppose these graders are Bob and Mike. Let Bob’s partner be Alice and let Mike’s partner be Nicole.",
        "Sam is then rewarded as follows:", "He gets a starting reward of $1.", "He then pays a penalty of $1 if Lisa’s grade is same as Alice’s.",
        "But then he gets a bonus of $0.5 if Alice’s grade is same as Nicole’s.","For instance, if Sam gives an B, while Lisa, Nicole and Alice give an A, Sam would receive a total reward of $1-1+0.5=\\$0.50$."];
      }
    }
  }
});
