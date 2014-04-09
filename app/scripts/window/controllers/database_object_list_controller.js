chromeMyAdmin.controller("DatabaseObjectListController", ["$scope", "mySQLClientService", "targetObjectService", "modeService", "Events", "Modes", function($scope, mySQLClientService, targetObjectService, modeService, Events, Modes) {
    "use strict";

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustObjectListHeight();
        });
    };

    var adjustObjectListHeight = function() {
        $("#objectList").height($(window).height() - 51 - 35);
    };

    var databaseChanged = function() {
        targetObjectService.resetTable();
        mySQLClientService.query(
            "USE " + targetObjectService.getDatabase()).then(function(result) {
                if (result.hasResultsetRows) {
                    $scope.fatalErrorOccurred("Changing database failed.");
                } else {
                    loadTables();
                }
            }, function(reason) {
                var errorMessage = reason.errorMessage;
                $scope.fatalErrorOccurred(errorMessage);
            });
    };

    var loadTables = function() {
        mySQLClientService.query("SHOW TABLES").then(function(result) {
            if (result.hasResultsetRows) {
                updateTableList(
                    result.columnDefinitions,
                    result.resultsetRows);
            } else {
                $scope.fatalErrorOccurred("Retrieving tables failed.");
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var updateTableList = function(columnDefinition, resultsetRows) {
        var tables = [];
        for (var i = 0; i < resultsetRows.length; i++) {
            tables.push(resultsetRows[i].values[0]);
        }
        $scope.tables = tables;
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            $scope.tables = [];
        }
    };

    $scope.initialize = function() {
        $scope.$on(Events.DATABASE_CHANGED, function(event, database) {
            databaseChanged();
        });
        $scope.tables = [];
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
        assignWindowResizeEventHandler();
        adjustObjectListHeight();
    };

    $scope.selectTable = function(tableName) {
        targetObjectService.changeTable(tableName);
        if (modeService.getMode() === Modes.DATABASE) {
            modeService.changeMode(Modes.ROWS);
        }
    };

    $scope.isTableActive = function(tableName) {
        return tableName === targetObjectService.getTable();
    };

    $scope.refresh = function() {
        if (targetObjectService.getDatabase()) {
            targetObjectService.resetTable();
            loadTables();
        }
    };

    $scope.isDatabaseObjectListVisible = function() {
        return mySQLClientService.isConnected();
    };

}]);