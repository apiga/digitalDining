/*jshint camelcase: false */
angular.module('dd-homeFactories', [])

.factory('HomeFactory', ['$http', '$window', function ($http, $window) {
  var getAllRestaurants = function () {
    return $http({
      // url: 'http://localhost:8000/api/restaurants',
      url: window.isMobileDev ? 'http://localhost:8000/api/restaurants' : 'http://52.33.58.174:8000/api/restaurants',
      method: 'GET'
    });
  };

  var getParty = function () {
    return $http({
      // url: 'http://localhost:8000/api/parties?user=true',
      url: window.isMobileDev ? 'http://localhost:8000/api/parties?user=true' : 'http://52.33.58.174:8000/api/parties?user=true',
      method: 'GET'
    });
  };

  var getRestaurant = function (rid) {
    return $http({
      // url: 'http://localhost:8000/api/restaurants/' + rid,
      url: window.isMobileDev ? 'http://localhost:8000/api/restaurants/' + rid : 'http://52.33.58.174:8000/api/restaurants/' + rid,
      method: 'GET'
    });
  };

  var focusedRestaurant = {};

  var focusRestaurant = function (rest) {
    focusedRestaurant = rest;
  };

  var getFocusedRestaurant = function () {
    //check if user is in a party
    //if yes, return the party restaurant and set local storage values
    //if no, use focusedRestaurant
    return getParty()
      .then(function (party) {
        if (party.data.data) {
          $window.localStorage.setItem('partyInfo', JSON.stringify(party));
          $window.localStorage.setItem('partyId', JSON.stringify(party.data.data[0].id));
          $window.localStorage.setItem('restaurantId', JSON.stringify(party.data.data[0].attributes.restaurantId));
          return getRestaurant(party.data.data[0].attributes.restaurantId)
            .then(function (rest) {
              return rest.data.data[0];
            });
        } else {
          $window.localStorage.removeItem('partyInfo');
          $window.localStorage.removeItem('partyId');
          $window.localStorage.removeItem('restaurantId');
          return focusedRestaurant;
        }
      });
  };

  var convertAddress = function (address) {
    return $http({
      url: window.isMobileDev ? 'http://localhost:8000/api/convertaddress?address=' + address : 'http://52.33.58.174:8000/api/convertaddress?address=' + address,
      method: 'GET'
      });
  };

  return {
    getRestaurant: getRestaurant,
    getAllRestaurants: getAllRestaurants,
    focusedRestaurant: focusedRestaurant,
    focusRestaurant: focusRestaurant,
    getFocusedRestaurant: getFocusedRestaurant,
    convertAddress: convertAddress
  };
}])

//adds the JWT to all outgoing http requests
.factory('AttachTokens', ['$window', function ($window) {
  var attach = {
    request: function (object) {
      var jwt = $window.localStorage.getItem('digitaldining');
      if (jwt) {
        object.headers.authorization = jwt;
      }
      return object;
    }
  };
  return attach;
}]);
