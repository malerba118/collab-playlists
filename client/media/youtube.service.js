
app.factory('YoutubeService', ['$http', '$localStorage', '$rootScope', '$q', 'APIS', function ($http, $localStorage, $rootScope, $q, APIS) {
      var service =  {};

      service.search = function(query, page) {

            return $http.get(APIS.YOUTUBE_API.BASE_URL + "/search", {
              params : {
                part: 'snippet',
                key: APIS.YOUTUBE_API.KEY,
                type: 'video',
                videoEmbeddable: true,
                maxResults: 8,
                videoCategoryId: 10,
                q: query
              }
            })
            .then(function(response){
              return response.data;
            },
            function (response) {
              console.log("error: " + response.statusText);
              return $q.reject(response.data);
            });

    };

    service.getVideos = function(videoIds) {

          return $http.get(APIS.YOUTUBE_API.BASE_URL + "/videos", {
            params : {
              part: 'snippet',
              key: APIS.YOUTUBE_API.KEY,
              id: videoIds.toString()
            }
          })
          .then(function(response){
            return response.data;
          },
          function (response) {
            console.log("error: " + response.statusText);
            return $q.reject(response.data);
          });

  };



    return service
}]);
