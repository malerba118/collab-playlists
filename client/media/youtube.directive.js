app.directive('youtube', function($window, $rootScope) {
  return {
    restrict: "E",

    scope: {
      height: "@",
      width: "@",
      videoid: "@",
      onFinish: "&"
    },

    template: '<div></div>',

    link: function(scope, element) {
      // var tag = document.createElement('script');
      // tag.src = "https://www.youtube.com/iframe_api";
      // var firstScriptTag = document.getElementsByTagName('script')[0];
      // firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);



      if ($rootScope.youtube.ready) {
        console.log("YOUTUBE READY");

        var player = new YT.Player(element.children()[0], {
          playerVars: {
            autoplay: 1,
            html5: 1,
            theme: "light",
            modesbranding: 0,
            color: "white",
            iv_load_policy: 3,
            showinfo: 1,
            controls: 1
          },

          height: scope.height,
          width: scope.width,
          videoId: scope.videoid,
          events: {
            onStateChange: function(event) {
              //Video ended
              if (event.data === 0) {
                console.log("ended");
                scope.onFinish();
              }
            },
            onError: function(event) {
              //select next video
              scope.onFinish();
            },
            onReady: function(event) {
              player.cueVideoById(scope.videoid);
              scope.$watch('videoid', function(newValue, oldValue) {
                if (newValue == oldValue) {
                  return;
                }
                player.loadVideoById(scope.videoid);
              });
            }
          }
        });

      }

      angular.element($window).bind('resize', function(){

         scope.width = $window.innerWidth;
         scope.height = scope.width * 9 / 16;
         scope.$digest();

         player.setSize(scope.width, scope.height);
       });

      // scope.$watch('height + width', function(newValue, oldValue) {
      //   if (newValue == oldValue) {
      //     return;
      //   }
      //
      //   player.setSize(scope.width, scope.height);
      //
      // });
    }
  };
});
