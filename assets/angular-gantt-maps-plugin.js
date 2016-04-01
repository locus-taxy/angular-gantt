/*
Project: angular-gantt v1.2.13 - Gantt chart component for AngularJS
Authors: Marco Schweighauser, Rémi Alvergnat
License: MIT
Homepage: https://www.angular-gantt.com
Github: https://github.com/angular-gantt/angular-gantt.git
*/
(function(){
    'use strict';
    angular.module('gantt.maps', ['gantt', 'gantt.maps.templates']).directive('ganttMaps', ['ganttUtils', '$compile', '$document', function(utils, $compile, $document) {
        // Provides the row sort functionality to any Gantt row
        // Uses the sortableState to share the current row

        return {
            restrict: 'E',
            require: '^gantt',
            scope: {
                enabled: '=?',
                header: '=?',
                content: '=?',
                headerContent: '=?',
                keepAncestorOnFilterRow: '=?'
            },
            link: function(scope, element, attrs, ganttCtrl) {
                var api = ganttCtrl.gantt.api;

                // Load options from global options attribute.
                if (scope.options && typeof(scope.options.sortable) === 'object') {
                    for (var option in scope.options.sortable) {
                        scope[option] = scope.options[option];
                    }
                }

                if (scope.enabled === undefined) {
                    scope.enabled = true;
                }

                if (scope.header === undefined) {
                    scope.header = 'Name';
                }

                if (scope.headerContent === undefined) {
                    scope.headerContent = '{{getHeader()}}';
                }

                if (scope.keepAncestorOnFilterRow === undefined) {
                    scope.keepAncestorOnFilterRow = false;
                }

                api.directives.on.new(scope, function(directiveName, sideContentScope, sideContentElement) {
                    if (directiveName === 'ganttScrollableHeader') {
                        var labelsScope = sideContentScope.$new();
                        labelsScope.pluginScope = scope;

                        var ifElement = $document[0].createElement('div');
                        angular.element(ifElement).attr('data-ng-if', 'pluginScope.enabled');

                        var labelsElement = $document[0].createElement('gantt-side-maps');
                        angular.element(ifElement).append(labelsElement);

                        sideContentElement.parent().append($compile(ifElement)(labelsScope));
                    }
                });
            }
        };
    }]);
}());
(function(){
    'use strict';
    angular.module('gantt.maps').directive('ganttSideMapBody', ['GanttDirectiveBuilder', function(Builder) {
        var builder = new Builder('ganttSideMapBody', 'plugins/maps/ganttSideMapBody.tmpl.html');
        return builder.build();
    }]);
}());


(function(){
    'use strict';
    angular.module('gantt.maps').directive('ganttSideMaps', ['GanttDirectiveBuilder', function(Builder) {
        var builder = new Builder('ganttSideMaps', 'plugins/maps/ganttSideMaps.tmpl.html');
        return builder.build();
    }]);
}());



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
angular.module('gantt.maps.templates', []).run(['$templateCache', function($templateCache) {
    $templateCache.put('plugins/maps/ganttSideMapBody.tmpl.html',
        '<div ng-style="getLabelsCss()">\n' +
        '    <div class="ui modal">\n' +
        '        <i class="close icon"></i>\n' +
        '        <div class="header">\n' +
        '            Please Choose a Location\n' +
        '        </div>\n' +
        '        <div class="image content">\n' +
        '            <script type="text/ng-template" id="searchbox.tpl.html">\n' +
        '                <input type="text" placeholder="Search" class="searchbox">\n' +
        '            </script>\n' +
        '            <ui-gmap-google-map center=\'map.center\' pan="true" zoom=\'map.zoom\' draggable="true" control="control" style="width: 100%;height: 400px;" events="events">\n' +
        '                <ui-gmap-search-box template="searchbox.template" events="searchbox.events" position="\'TOP_LEFT\'"></ui-gmap-search-box>\n' +
        '                <ui-gmap-marker idKey=\'marker.id\'  control="markerControl" coords=\'marker.coords\' options="markerOption">\n' +
        '                </ui-gmap-marker>\n' +
        '            </ui-gmap-google-map>\n' +
        '        </div>\n' +
        '        <div class="actions">\n' +
        '            <div class="ui black deny button" ng-click="onCancel()">\n' +
        '                Cancel\n' +
        '            </div>\n' +
        '            <div class="ui positive labeled icon button" ng-click="onChoose()">\n' +
        '                Choose\n' +
        '                <i class="checkmark icon"></i>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '    <div gantt-vertical-scroll-receiver>\n' +
        '        <div class="gantt-row-label-background">\n' +
        '            <div class="gantt-row-label gantt-row-height" ng-class=\'row.model.classes\' ng-style="{\'height\': row.model.height}" ng-repeat="row in gantt.rowsManager.visibleRows track by row.model.id">\n' +
        '                <div ng-if="row.model.map" class="gantt-map-container" ng-class="row.model.map.classes"><img ng-src="/img/choose-location-placeholder.png" style="cursor:pointer; margin:auto" ng-click="displayMap(row)"></img>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>');
    $templateCache.put('plugins/maps/ganttSideMaps.tmpl.html',
        '<div ng-controller="MapsController" style="position:absolute;width:270px;right:0px;">\n' +
        '<gantt-tree-header>\n' +
        '</gantt-tree-header>\n' +
        '<gantt-side-map-body>\n' +
        '</gantt-side-map-body>\n' +
        '</div>');
}]);

//# sourceMappingURL=angular-gantt-maps-plugin.js.map