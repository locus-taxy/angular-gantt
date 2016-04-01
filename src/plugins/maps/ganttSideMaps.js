(function(){
    'use strict';
    angular.module('gantt.maps').directive('ganttSideMaps', ['GanttDirectiveBuilder', function(Builder) {
        var builder = new Builder('ganttSideMaps', 'plugins/maps/ganttSideMaps.tmpl.html');
        return builder.build();
    }]);
}());

