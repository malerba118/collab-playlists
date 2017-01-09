
app.factory('LocService', ['$http', '$localStorage', '$rootScope', '$q', 'APIS', function ($http, $localStorage, $rootScope, $q, APIS) {
      var service =  {};

      service.getLocation = function () {

            return $http.post(APIS.LOCATION_API.BASE_URL + '/geolocate' + '?' + 'key=' + APIS.LOCATION_API.KEY, {})
            .then(function(response){
              return response.data;
            },
            function (response) {
              console.log("error: " + response.statusText);
              return $q.reject(response.data);
            });
           // FB.api('/me', function(response) {
           //   console.log('Good to see you, ' + response.name + '.');
           // });

    };

    return service
}]);
