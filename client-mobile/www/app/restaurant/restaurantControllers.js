angular.module('dd-restCtrls', [])

.controller('RestaurantMenuCtrl', ['$scope', '$state', '$window', 'MenuFactory', 'HomeFactory', 'OrderFactory', function ($scope, $state, $window, MenuFactory, HomeFactory, OrderFactory) {

  $scope.goToReservation = function () {
    $state.go('nav.checkIn');
  };

  $scope.getMenuItems = function () {
   HomeFactory.getFocusedRestaurant()
    .then (function (rest) {
     $scope.focusedRestaurant = rest;
       if ($window.localStorage.getItem('partyId')) {
         $scope.isCheckedIn = true;
       } else {
         $scope.isCheckedIn = false;
       }
      MenuFactory.getMenuItems(rest.id).then(function (dataObject) {
        var menuItems = dataObject.data.data;
        var categories = dataObject.data.included;
        $scope.menu = {};

        for (var itemIndex = 0; itemIndex < menuItems.length; itemIndex++) {
          if (!$scope.menu[categories[itemIndex].attributes.categoryName]) {
            menuItems[itemIndex].attributes.menuID = menuItems[itemIndex].id;
            menuItems[itemIndex].attributes.quantity = 0;
            $scope.menu[categories[itemIndex].attributes.categoryName] = [menuItems[itemIndex].attributes];
          } else {
            menuItems[itemIndex].attributes.menuID = menuItems[itemIndex].id;
            menuItems[itemIndex].attributes.quantity = 0;
            $scope.menu[categories[itemIndex].attributes.categoryName].push(menuItems[itemIndex].attributes);
          }
        }
      });
    });
  };

  $scope.getMenuItems();

  $scope.clickLocationCheckingForOrder = function (event, item) {
    if (event.srcElement.className === 'item activated') {
      MenuFactory.focusMenuItem(item);
      $state.go('nav.menuItemDescription');
    } else if (event.srcElement.className === 'addButton icon ion-plus-circled') {
      item.isOrdered = !item.isOrdered;
      OrderFactory.addItemToOrder(item);
    } else if (event.srcElement.className === 'removeButton icon ion-minus-circled') {
      item.isOrdered = !item.isOrdered;
      OrderFactory.removeItemFromOrder(item);
    }
  };

  $scope.sendOrder = function () {
    var partyId = JSON.parse($window.localStorage.getItem('partyId'));
    OrderFactory.sendOrder(partyId);
    $state.go('nav.currentCheck');
  };
  $scope.addItemToOrder = function (item) {
    OrderFactory.addItemToOrder(item);
  };

}])


.controller('RestaurantDisplayCtrl', ['$scope', '$state', '$window', 'HomeFactory', function ($scope, $state, $window, HomeFactory) {

  $scope.goToReservation = function () {
    $state.go('nav.checkIn');
  };

  $scope.getFocusedRestaurant = function () {
    HomeFactory.getFocusedRestaurant()
      .then(function (rest) {
        if ($window.localStorage.getItem('partyId')) {
          $scope.isCheckedIn = true;
        } else {
          $scope.isCheckedIn = false;
        }
        $scope.focusedRestaurant = rest;
      });
  };

  $scope.getFocusedRestaurant();

}])


.controller('MenuItemDisplayCtrl', ['$scope', 'MenuFactory', 'OrderFactory', 'CheckInFactory', '$window', function ($scope, MenuFactory, OrderFactory, CheckInFactory, $window) {
  $scope.getFocusedMenuItem = function () {
    $scope.focusedMenuItem = MenuFactory.getFocusedMenuItem();
    console.dir($scope.focusedMenuItem);
  };
  $scope.getFocusedMenuItem();

  $scope.getCheckInStatus = function () {
    if ($window.localStorage.getItem('partyId')) {
      $scope.isCheckedIn = true;
    } else {
      $scope.isCheckedIn = false;
    }
  };
  $scope.getCheckInStatus();

  $scope.addItemToOrder = function (item) {
    item.isOrdered = !item.isOrdered;
    OrderFactory.addItemToOrder(item);
  };
  $scope.removeItemFromOrder = function (item) {
    item.isOrdered = !item.isOrdered;
    OrderFactory.removeItemFromOrder(item);
  };
}]);
