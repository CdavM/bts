
// Function is called with Meteor.call(name string, array of answers, question_ID);
// Function is called for every question
// Function must return an array of payments, the positions must correspond to the blabla
// Implemented as described in Winkler and Murphy's "Good Probability Assessors" http://www.eecs.harvard.edu/cs286r/courses/fall10/papers/Winkler68.pdf
Meteor.methods({
	PaymentBTS: function(answer_array, question_ID){
	  xbar = answer_array.length;

	},


	PaymentQuadratic: function(answer_array, question_ID){
		var payments_array = [];
		for (var i = 0; i < answer_array.length; i++) {
			var observation_value = answer_array[  i].answer1[question_ID].observation;
			var observation_probability = answer_array[i].answer1[question_ID].probability[observation_value];
			console.log("observation_value is "+observation_value);
			console.log("observation_probability is "+observation_probability);
			var probability_sum_of_squares = 0;
			for (var j = 0; j < answer_array[i].answer1[question_ID].probability; j++) {
			 	probability_sum_of_squares += Math.pow(answer_array[i].answer1[question_ID].probability[j],2);
			 };
			var payment_value = 2*observation_probability - probability_sum_of_squares;
			payments_array[i]=payment_value;
		};
		return payments_array;
	},

	PaymentLogarithmic: function(answer_array, question_ID){
		var payments_array = [];
		for (var i = 0; i < answer_array.length; i++) {
			var observation_value = answer_array[i].answer1[question_ID].observation;
			var observation_probability = answer_array[i].answer1[question_ID].probability[observation_value];
			var payment_value = Math.log(observation_probability);
			payments_array[i]=payment_value;
		};
		return payments_array;
	},

	PaymentSpherical: function(answer_array, question_ID){
		var payments_array = [];
		for (var i = 0; i < answer_array.length; i++) {
			var observation_value = answer_array[i].answer1[question_ID].observation;
			var observation_probability = answer_array[i].answer1[question_ID].probability[observation_value];
			var probability_norm = 0;
			for (var j = 0; j < answer_array[i].answer1[question_ID].probability; j++) {
			 	probability_norm += Math.pow(answer_array[i].answer1[question_ID].probability[j],2);
			};
			probability_norm = Math.sqrt(probability_norm);
			var payment_value = observation_probability/probability_norm;
			payments_array[i]=payment_value;
		};
		return payments_array;
	}
});
