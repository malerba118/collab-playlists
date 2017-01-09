var app = angular.module('app', [
   'ngStorage',
   'ui.router',
   'ngMaterial',
]);

app.run(function($window, $rootScope) {
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8&appId=1238602722888137";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  $window.onYouTubeIframeAPIReady = function() {
    $rootScope.youtube = {}
    $rootScope.youtube.ready = true;
  };
});



app.run(function($rootScope, $location, $state, AuthService) {


    $rootScope.$on( '$stateChangeStart', function(e, toState  , toParams
                                                   , fromState, fromParams) {

        var isLogin = toState.name === "root.login";
        if(isLogin){
           return; // no need to redirect
        }

        // now, redirect only not authenticated

        if(! AuthService.user.authenticated) {
            e.preventDefault(); // stop current execution
            $state.go('root.login'); // go to login
        }
    });
});

app.constant('APIS', {
  LOCATION_API: {
    BASE_URL: 'https://www.googleapis.com/geolocation/v1',
    KEY: 'AIzaSyBph1aSn5ieKc2WEchkRy_dep7TuU3IRsI'
  },
  QUEUES_API: {
    BASE_URL: 'http://localhost:8000/api',
    CLIENT_ID: 'ocYZ39OBL5g3Gop9MCElJ7YksEsekERQjvrYCcIN',
    CLIENT_SECRET: 'weaNjNMvqfzZ7Ri0zTCrpnMnotRSEWgNoO4b6B8LU0PVgTFkekaJm7Nx8rwKpIiNdSjnvpQPCRufT5p8Dfpvosc0qzbWO0kLtauSudl2dJWvQXmQb3p9WJJoaa8VsJCB'
  },
  YOUTUBE_API: {
    BASE_URL: 'https://www.googleapis.com/youtube/v3',
    KEY: 'AIzaSyBph1aSn5ieKc2WEchkRy_dep7TuU3IRsI'
  }
});


app.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

  // Now set up the states
  $stateProvider
    .state('root', {
      abstract: true,
      url: "/",
      templateUrl: "root.html",
      controller: 'HomeController'
    })
    .state('root.login', {
      url: "login/",
      templateUrl: "login.html",
    })
    .state('root.queue-list', {
      abstract: true,
      url: "queues/",
      templateUrl: "playlists/queue-list-partial.html",
      controller: function($scope,  LocService, QueueService, $mdDialog, $state) {

        $scope.nav = {};

        $scope.getLocation = function() {
           LocService.getLocation().then(function(data) {
             console.log(data);
             $scope.location = data.location;
           });
        };

        $scope.showPrompt = function(ev, queueId) {
          // Appending dialog to document.body to cover sidenav in docs app
          var confirm = $mdDialog.prompt()
            .title("Enter the playlist's passcode")
            // .textContent('Bowser is a common name.')
            .placeholder('Passcode')
            .ariaLabel('Passcode')
            .initialValue('')
            .targetEvent(ev)
            .ok('Go!')
            .cancel('Cancel');

          $mdDialog.show(confirm).then(function(result) {
            //clicked okay
            QueueService.requestQueuePermission(queueId, result).then(
              function(data){
                //permission granted
                $state.go('root.queue-detail.playing', {queueId: queueId})
              },
              function(data){
                //permission not granted
              }
            );
          }, function() {
            //clicked cancel
            $scope.status = 'You didn\'t name your dog.';
          });
        };

        $scope.attemptToOpen = function(ev, queueId, permitted){
          if (permitted) {
            $state.go('root.queue-detail.playing', {queueId: queueId});
          }
          else {
            $scope.showPrompt(ev, queueId);
          }
        };

        $scope.createQueue = function(name, passcode) {
          $scope.selected = LocService.getLocation().then(function(data) {
            return QueueService.createQueue(name, passcode, data.location.lat, data.location.lng).then(function(data){
              $state.go('root.queue-detail.add', {queueId: data.id});
            });
          });
        };

      }
    })
    .state('root.queue-list.search', {
      url: "search/",
      templateUrl: "playlists/queue-list-search-partial.html",
      controller: function($scope, QueueService) {

        $scope.nav.currentNavItem = "page1";

        $scope.getQueues = function(query) {
          QueueService.getQueues(query).then(function(data){
            console.log(data);
            $scope.queues = data.results;
          });
        };
        $scope.getQueues();
      }
    })
    .state('root.queue-list.mine', {
      url: "mine/",
      templateUrl: "playlists/queue-list-mine-partial.html",
      controller: function($scope, QueueService) {

        $scope.nav.currentNavItem = "page3";

        $scope.getMyQueues = function() {
          QueueService.getMyQueues().then(function(data){
            $scope.queues = data.results;
          });
        };
        $scope.getMyQueues();
      }
    })
    .state('root.queue-list.create', {
      url: "create/",
      templateUrl: "playlists/queue-list-create-partial.html",
      controller: function($scope) {
        $scope.nav.currentNavItem = "page2";
      }
    })
    .state('root.queue-detail', {
      abstract: true,
      url: "queues/:queueId/",
      templateUrl: "playlists/queue-detail-partial.html",
      controller: function($scope, $stateParams, $state, $q, $window, YoutubeService, QueueService) {

        $scope.nav = {};

        $scope.yt = {};
        $scope.yt.width = $window.innerWidth;
        $scope.yt.height = ($scope.yt.width * 9 / 16)

        $scope.id = $stateParams.queueId;
        $scope.queue = {};

        $scope.search = function(query) {
          YoutubeService.search(query, 0).then(function(data) {
            $scope.searchResults = data.items
          });
        };

        $scope.createItem = function(trackId) {
          QueueService.createItem($stateParams.queueId, trackId).then(function(data) {
            $state.go('root.queue-detail.playing');
          });
        };

        $scope.getItems = function() {
          itemsInfo = QueueService.getItems($stateParams.queueId)
          queueInfo = QueueService.getQueue($stateParams.queueId)

          $q.all({items: itemsInfo, queue: queueInfo})
          .then(function(data) {
            listOfIds = data.items.results.map(function(item){return item.track_id});
            YoutubeService.getVideos(listOfIds).then(function(data){
              console.log(data);
              $scope.queue.items = data.items;
            });
            $scope.queue.details = data.queue;
            if (data.queue.selected != null) {
              $scope.yt.selectedVideoId = data.queue.selected.track_id;
            }
          });
        };


        $scope.selectNext = function() {
          console.log("ended");
          QueueService.selectNext($stateParams.queueId).then(function() {
            console.log("selected next");
            $scope.getItems();
          });
        };

        $scope.selectItem = function(trackId) {
          console.log(trackId);
          QueueService.selectItem($stateParams.queueId, trackId).then(function() {
            $scope.getItems();
          });
        };



      }
    })
    .state('root.queue-detail.add', {
      url: "add/",
      templateUrl: "playlists/queue-detail-add-partial.html",
      controller: function($scope) {
        $scope.getItems();
        $scope.nav.currentNavItem = "page1";

      }
    })
    .state('root.queue-detail.playing', {
      url: "playing/",
      templateUrl: "playlists/queue-detail-playing-partial.html",
      controller: function($scope) {
        $scope.getItems();
        $scope.nav.currentNavItem = "page2";

      }
    });

    $urlRouterProvider.otherwise("/queues/search/");
}]);

app.config(['$httpProvider', 'APIS', function ($httpProvider, APIS) {

        $httpProvider.interceptors.push(['$q', '$location', '$localStorage', 'APIS', function ($q, $location, $localStorage, APIS) {
            return {
                'request': function (config) {
                        config.headers = config.headers || {};
                        console.log(config.url);
                        if(config.url.startsWith(APIS.QUEUES_API.BASE_URL)) {
                          if ($localStorage.accessToken) {
                              config.headers.Authorization = 'Bearer ' + $localStorage.accessToken;
                          }
                        }
                        return config;
                  },
                 'responseError': function (response) {
                     if (response.status === 401 && config.url.startsWith(APIS.QUEUES_API.BASE_URL)) {
                         delete $localStorage.accessToken;
                         $location.path('/login/');
                     }
                     return $q.reject(response);
                  }
            };
        }]);

  }]);
