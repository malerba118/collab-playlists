
app.factory('QueueService', ['$http', '$localStorage', '$rootScope', '$q', 'APIS', 'LocService', function ($http, $localStorage, $rootScope, $q, APIS, LocService) {
      var service =  {};
      var success = function(response){
        return response.data;
      };
      var error = function (response) {
        console.log("error: " + response.statusText);
        return $q.reject(response.data);
      };

      service.getQueues = function (query) {
          return LocService.getLocation().then(function(data){
            console.log(data.location.lat);
            console.log(data.location.lng);
            return $http.get(APIS.QUEUES_API.BASE_URL + '/queues/', {
              params: {
                search: query,
                latitude: data.location.lat,
                longitude: data.location.lng
              }
            }).then(success, error);
          });
      };

      service.getMyQueues = function (query) {
          return $http.get(APIS.QUEUES_API.BASE_URL + '/queues/', {
            params: {
              mine: true,
            }
          }).then(success, error);
      };


      service.getQueue = function (id) {
         return $http.get(APIS.QUEUES_API.BASE_URL + '/queues/' + id + '/').then(success, error);
      };

      service.createQueue = function (name, passcode, lat, lng) {
          return $http.post(APIS.QUEUES_API.BASE_URL + '/queues/', {
            name: name,
            passcode: passcode,
            location : {
              latitude: lat,
              longitude: lng
            }
          }).then(success, error);
      };

      service.createItem = function (queueId, trackId) {
          return $http.post(APIS.QUEUES_API.BASE_URL + '/queues/' + queueId + '/items/', {
            track_id: trackId,
          }).then(success, error);
      };

      service.requestQueuePermission = function (queueId, passcode) {
          return $http.post(APIS.QUEUES_API.BASE_URL + '/queues/' + queueId + '/permissions/', {
            passcode: passcode,
          }).then(success, error);
      };

      service.getItems = function (queueId) {
          return $http.get(APIS.QUEUES_API.BASE_URL + '/queues/' + queueId + '/items/').then(success, error);
      };

      service.selectNext = function (queueId) {
          return $http.post(APIS.QUEUES_API.BASE_URL + '/queues/' + queueId + '/select-next/').then(success, error);
      };

      service.selectItem = function (queueId, itemId) {
        return $http.post(APIS.QUEUES_API.BASE_URL + '/queues/' + queueId + '/select-next/', {
          item_id: itemId,
        }).then(success, error);
      };

      service.deleteItem = function (queueId, itemId) {
          return $http.delete(APIS.QUEUES_API.BASE_URL + '/queues/' + queueId + '/items/' + itemId + "/").then(success, error);
      };

      service.deleteQueue = function (queueId) {
          return $http.delete(APIS.QUEUES_API.BASE_URL + '/queues/' + queueId + "/").then(success, error);
      };

      return service;
}]);
