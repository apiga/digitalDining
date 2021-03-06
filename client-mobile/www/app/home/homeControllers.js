/*jshint camelcase: false */
angular.module('dd-homeCtrls', [])

.controller('NavCtrl', ['$state', '$scope', '$window', 'HomeFactory', function ($state, $scope, $window, HomeFactory) {

  $scope.logout = function () {
    if ($window.localStorage.getItem('digitaldining')) {
      $window.localStorage.removeItem('digitaldining');
    }
    $window.localStorage.removeItem('partyInfo');
    $window.localStorage.removeItem('partyId');
    $window.localStorage.removeItem('restaurantId');
    $state.go('app');
  };

  $scope.clearStorage = function () {
    $window.localStorage.removeItem('partyInfo');
    $window.localStorage.removeItem('partyId');
    $window.localStorage.removeItem('restaurantId');
  };

  //use to conditionally show the reservation link
  $scope.getCheckedInStatus = function () {
    HomeFactory.getFocusedRestaurant()
      .then (function () {
        if ($window.localStorage.getItem('partyInfo')) {
          $scope.isCheckedIn = true;
        } else {
          $scope.isCheckedIn = false;
        }
    });
  };

  $scope.getCheckedInStatus();

}])

.controller('HomeCtrl', ['$scope', 'HomeFactory', '$window', function ($scope, HomeFactory, $window) {
  $scope.checkedIn = false;

  var getLocation = function (cb) {
      var onSuccess = function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        cb([lat, lng]);
      };
      var onError = function (error) {
        console.log('error in getting location, code: ' + error.code + '\n' +
              'message: ' + error.message + '\n');
        cb([error.message, error.message]);
      };
      window.navigator.geolocation.getCurrentPosition(onSuccess, onError);
  };

  var distance = function (x1, y1, x2, y2) {
    if (!Number (x1) || !Number (x2) || !Number (y1) || !Number (y2)) {
      return null;
    }

    var xlen = x1 - x2;
    var ylen = y1 - y2;

    ylen = (ylen * 110.574) * 0.62137119;
    xlen = (xlen * (111.320 * Math.cos(((y1 + y2) / 2) * Math.PI / 180) * 0.62137119));

    return Math.sqrt(Math.pow(xlen, 2) + Math.pow(ylen, 2));
  };

  $scope.displayRestaurants = function () {
    if ($window.localStorage.getItem('restaurantId')) {
      HomeFactory.getRestaurant($window.localStorage.getItem('restaurantId')).then(processRestaurants);
      $scope.checkedIn = true;
    } else {
      HomeFactory.getAllRestaurants().then(processRestaurants);
      $scope.checkedIn = false;
    }
  };

  var processRestaurants = function (restaurants) {
    $scope.restaurants = restaurants.data.data;
    getLocation(function (latLng) {
      //lookup coords for each rest via google maps
      restaurants.data.data.forEach(function (restaurant) {
        var address = restaurant.attributes.restaurantAddress + ',' + restaurant.attributes.restaurantCity + ',' + restaurant.attributes.restaurantState;
        HomeFactory.convertAddress(address)
          .then(function (mapResult) {
            //run through distance function and append distance to restaurants.data.data
            restaurant.attributes.distance = distance(mapResult.data.results[0].geometry.location.lng, mapResult.data.results[0].geometry.location.lat, latLng[1], latLng[0]);
               $scope.restaurants = restaurants.data.data;
          });
      });
    });
  };

  $scope.displayRestaurants();

  $scope.focusRestaurant = function (rest) {
    HomeFactory.focusRestaurant(rest);
  };
}]);
