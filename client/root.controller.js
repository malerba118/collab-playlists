app.controller('RootController', ['$scope', '$state', 'AuthService', function ($scope, $state, AuthService) {

    $scope.logIn = function () {
      AuthService.logIn();
    };

    $scope.logOut = function () {
      AuthService.logOut();
    };


    $scope.user = AuthService.user;

}]);
