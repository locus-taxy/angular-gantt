
 angular.module('gantt.maps').controller('MapsController', ['$scope', '$timeout', function($scope, $timeout) {
     $scope.refreshMap = false;
     $scope.control = {};
     $scope.marker = { coords: { latitude: 0, longitude: 0 }, id: 1 };
     $scope.markerControl = {};
     $scope.markerOption = { draggable: true }
     var searchBoxEvents = {
         places_changed: function(searchBox) {
             $scope.control.getGMap().panTo(searchBox.getPlaces()[0].geometry.location);
             $scope.markerControl.getGMarkers()[0].setPosition(searchBox.getPlaces()[0].geometry.location);
             $scope.control.getGMap().fitBounds(searchBox.getPlaces()[0].geometry.viewport);
         }
     }
     $scope.events = {
         'click': function(map, eventName, event) {
             var latLng = event[0].latLng;
             $scope.markerControl.getGMarkers()[0].setPosition(latLng);
         }
     };



     $scope.searchbox = { template: 'searchbox.tpl.html', events: searchBoxEvents };
     $scope.map = { zoom: 5, center: { latitude: 17, longitude: 13 } };


     $scope.getHeaderContent = function() {
         return $scope.pluginScope.headerContent;
     };

     $scope.displayMap = function(row) {
         $scope.selectedRow = row;
         var latitude = row.model.map.latitude;
         var longitude = row.model.map.longitude;
         var latLng;
         if(latitude && longitude){
            latLng = new google.maps.LatLng(latitude, longitude);
         }
         else{
            latLng = new google.maps.LatLng(0, 0);
         }

        $scope.markerControl.getGMarkers()[0].setPosition(latLng);
        $scope.control.getGMap().panTo(latLng);

         $('.ui.modal').modal('show');
         $scope.control.refresh();
     }

     $scope.onChoose = function() {
        var latLng = $scope.markerControl.getGMarkers()[0].getPosition();
         $scope.selectedRow.model.map.latitude = latLng.lat();
         $scope.selectedRow.model.map.longitude = latLng.lng();
         $scope.setLocationForSelectedRows(latLng);
         $('.ui.modal').modal('hide');
     }

     $scope.onCancel = function() {
         $('.ui.modal').modal('hide');
     }

     $scope.setLocationForSelectedRows = function(latLng){
        $scope.gantt.rowsManager.rows.map(function(row){
            if(row.model.selected && row.model.map){
                row.model.map.latitude = latLng.lat();
                row.model.map.longitude = latLng.lng();
            }

        });
     }

 }]);