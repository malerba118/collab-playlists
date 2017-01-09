
app.factory('AuthService', ['$http', '$localStorage', '$rootScope', 'APIS', '$state', function ($http, $localStorage, $rootScope, APIS, $state) {

      var service =  {};

      service.user = {};
      service.user.authenticated = ($localStorage.accessToken != null);

      service.logIn = function () {
        FB.login(function(response) {
          if (response.authResponse) {
            console.log(response.authResponse);
            $http.post(APIS.QUEUES_API.BASE_URL + '/auth/convert-token', {
              client_id: APIS.QUEUES_API.CLIENT_ID,
              client_secret: APIS.QUEUES_API.CLIENT_SECRET,
              grant_type: 'convert_token',
              backend: 'facebook',
              token: response.authResponse.accessToken
            }).then(function(response){
              $localStorage.accessToken = response.data.access_token;
              service.user.authenticated = true;
              $state.go('root.queue-list.search');
            });
           // FB.api('/me', function(response) {
           //   console.log('Good to see you, ' + response.name + '.');
           // });
          } else {
            service.user.authenticated = false;
          }
        });
    };

    service.logOut = function () {
      delete $localStorage.accessToken;
      service.user.authenticated = false;
      FB.getLoginStatus(function(response) {
        if (response && response.status === 'connected') {
            FB.logout(function(response) {
                document.location.reload();
            });
        }
      });
      $state.go('root.login');
    };

    return service
}]);
