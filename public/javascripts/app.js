angular.module('app', [])
   .controller('ListControler', ['$scope', function($scope) {
   	$scope.places = markers;
    $scope.getPlaces = function(){
    	$scope.places = markers;
    };
   }]);