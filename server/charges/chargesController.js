/*jshint camelcase: false */
// TODO: change to env variable
var stripe = require('stripe')('sk_test_uJRTtfhOGyeUCoDUVrT5Ko6D');
var usersModel = require('../users/usersModel.js');

module.exports = {
  chargeCard : function (req) {

    //TODO: update user account with payment history info
    console.log('user id:', req.user.id); //currently undefined!!

    // Get the credit card details submitted by the form
    var stripeToken = req.body.stripeToken;
    var amount = req.body.amount;

    //look up current cust, get stripe id
    usersModel.user.get(req.user.id)
      .then(function (user) {
        if (user[0].stripe_id) {
          //charge
          return stripe.charges.create({
            amount: amount, // amount in cents
            currency: 'usd',
            customer: user[0].stripe_id // from DB
          })
          .then(function () {
            console.log('sucessful charge ');
          });
        } else {
          //create user
          stripe.customers.create({
            source: stripeToken,
            description: 'payinguser@example.com'
          }).then(function (stripeCustomer) {
            //save user
            user[0].stripe_id = stripeCustomer.id;
            usersModel.user.put(user[0].id, user[0]);

            return stripe.charges.create({
              amount: amount, // amount in cents
              currency: 'usd',
              customer: stripeCustomer.id
            });
          }).then(function () {
            console.log('sucessful charge ');
          });
        }
      });
  }
};
