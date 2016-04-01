(function(){
    'use strict';
    angular.module('gantt.maps').directive('ganttSideMapBody', ['GanttDirectiveBuilder', function(Builder) {
        var builder = new Builder('ganttSideMapBody', 'plugins/maps/ganttSideMapBody.tmpl.html');
        return builder.build();
    }]);
}());

