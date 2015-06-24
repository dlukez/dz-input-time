var

  TEST_CASES = {
    timeParser: {
      parse: [
        'hh:mm a',
        'h:mm a',
        'HH:mm',
        'HHmm'
      ],
      getUnitContainingCursor: [
        { format: 'H:mm'   , value: new Date(1970, 0, 1, 1, 40, 0) , pos: 1, expected: { start: 0, end: 1 } },
        { format: 'H:mm'   , value: new Date(1970, 0, 1, 23, 40, 0), pos: 1, expected: { start: 0, end: 2 } },
        { format: 'HH:mm'  , value: new Date(1970, 0, 1, 05, 40, 0), pos: 2, expected: { start: 0, end: 2 } },
        { format: 'HH:mm'  , value: new Date(1970, 0, 1, 16, 40, 0), pos: 3, expected: { start: 3, end: 5 } },
        { format: 'h:mm'   , value: new Date(1970, 0, 1, 1, 40, 0) , pos: 1, expected: { start: 0, end: 1 } },
        { format: 'h:mm'   , value: new Date(1970, 0, 1, 10, 40, 0), pos: 1, expected: { start: 0, end: 2 } },
        { format: 'hh:mm'  , value: new Date(1970, 0, 1, 05, 40, 0), pos: 1, expected: { start: 0, end: 2 } },
        { format: 'hh:mm'  , value: new Date(1970, 0, 1, 10, 40, 0), pos: 1, expected: { start: 0, end: 2 } },
        { format: 'h:mm a' , value: new Date(1970, 0, 1, 1, 40, 0) , pos: 3, expected: { start: 2, end: 4 } },
        { format: 'h:mm a' , value: new Date(1970, 0, 1, 10, 40, 0), pos: 6, expected: { start: 6, end: 8 } },
      ],
    }
  },

  KEYS = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    TAB: 9
  };

describe('dz.inputTime', function () {
  beforeEach(module('dz.inputTime'));

  describe('timeParser', function () {
    var timeParser;

    beforeEach(inject(function (dzInputTimeParser) {
      timeParser = dzInputTimeParser;
    }));

    describe('parse', function () {
      var makeTest,
        testCases = TEST_CASES.timeParser.parse;

      // run the test against each valid format
      makeTest = function (format) {
        return inject(function (dateFilter) {
          // Arrange
          var result,
            date = new Date(1970, 0, 1, 2, 10, 0),
            formatted = dateFilter(date, format);

          // Act
          result = timeParser.parse(formatted);

          // Assert
          expect(result.getHours()).toEqual(date.getHours());
          expect(result.getMinutes()).toEqual(date.getMinutes());
          expect(result.getSeconds()).toEqual(date.getSeconds());
        });
      };
      for (var i = 0; i < testCases.length; i++) {
        it('should parse ' + testCases[i], makeTest(testCases[i]));
      }
    });

    describe('getUnitContainingCursor', function () {
      var makeTestFn, testMessage,
        testCases = TEST_CASES.timeParser.getUnitContainingCursor;

      makeTestFn = function (testCase) {
        return function () {
          // Arrange
          var result;

          // Act
          result = timeParser.getUnitContainingCursor(
            testCase.pos,
            testCase.format,
            testCase.value);

          // Assert
          expect(result.start).toEqual(testCase.expected.start);
          expect(result.end).toEqual(testCase.expected.end);
        };
      };

      for (var i = 0; i < testCases.length; i++) {
        testMessage =  'should handle ';
        testMessage += testCases[i].format;
        testMessage += ' / ';
        testMessage += testCases[i].value.getHours()
          + ':'
          + testCases[i].value.getMinutes();
        it(testMessage, makeTestFn(testCases[i]));
      }
    });
  });

  describe('timeUnits', function () {
    var timeUnits;

    beforeEach(inject(function (dzInputTimeUnits) {
      timeUnits = dzInputTimeUnits;
    }));

    describe('hour', function () {
      it('should increment', function () {
        // Arrange
        var time = new Date(1970, 0, 1, 1, 0, 0);

        // Act
        timeUnits['12hour'].increment(time);

        // Assert
        expect(time.getHours()).toEqual(2);
      });

      it('should decrement', function () {
        // Arrange
        var time = new Date(1970, 0, 1, 2, 0, 0);

        // Act
        timeUnits['12hour'].decrement(time);

        // Assert
        expect(time.getHours()).toEqual(1);
      });

      it('should not change to am when incrementing', function () {

      });

      it('should not change to pm when incrementing', function () {
        // Arrange
        var time = new Date(1970, 0, 1, 11, 0, 0);

        // Act
        timeUnits['12hour'].increment(time);

        // Assert
        expect(time.getHours()).toEqual(0);
      });

      it('should not change the am/pm when decrementing', function () {
        // Arrange
        var time = new Date(1970, 0, 1, 0, 0, 0);

        // Act
        timeUnits['12hour'].decrement(time);

        // Assert
        expect(time.getHours()).toEqual(11);
      });
    });

    describe('minute', function () {
      it('should increment', function () {
        // Arrange
        var time = new Date(1970, 0, 1, 0, 1, 0);

        // Act
        timeUnits.minute.increment(time);

        // Assert
        expect(time.getMinutes()).toEqual(2);
      });

      it('should decrement', function () {
        // Arrange
        var time = new Date(1970, 0, 1, 0, 1, 0);

        // Act
        timeUnits.minute.decrement(time);

        // Assert
        expect(time.getHours()).toEqual(0);
      });

      it('should not change the hour when incrementing', function () {
        // Arrange
        var time = new Date(1970, 0, 1, 0, 59, 0);

        // Act
        timeUnits.minute.increment(time);

        // Assert
        expect(time.getHours()).toEqual(0);
      });

      it('should not change the hour when decrementing', function () {
        // Arrange
        var time = new Date(1970, 0, 1, 1, 0, 0);

        // Act
        timeUnits.minute.decrement(time);

        // Assert
        expect(time.getHours()).toEqual(1);
      });
    });

    describe('ampm', function () {
      it('should toggle when calling increment', function () {
        // Arrange
        var date = new Date(1970, 1, 1, 1, 0, 0);
        spyOn(timeUnits.ampm, 'toggle');

        // Act
        timeUnits.ampm.increment(date);

        // Assert
        expect(timeUnits.ampm.toggle).toHaveBeenCalledWith(date);
      });

      it('should toggle when calling decrement', function () {
        // Arrange
        var date = new Date(1970, 1, 1, 1, 0, 0);
        spyOn(timeUnits.ampm, 'toggle');

        // Act
        timeUnits.ampm.decrement(date);

        // Assert
        expect(timeUnits.ampm.toggle).toHaveBeenCalledWith(date);
      });

      it('should toggle correctly from am to pm', function () {
        // Arrange
        var date = new Date(1970, 1, 2, 1, 0, 0);

        // Act
        timeUnits.ampm.toggle(date);

        // Assert
        expect(date.getDate()).toEqual(2);
        expect(date.getHours()).toEqual(13);
      });

      it('should toggle correctly from pm to am', function () {
        // Arrange
        var date = new Date(1970, 1, 2, 13, 0, 0);

        // Act
        timeUnits.ampm.toggle(date);

        // Assert
        expect(date.getDate()).toEqual(2);
        expect(date.getHours()).toEqual(1);
      });
    });
  });

  describe('directive', function () {
    var el, input, $scope, $timeout, $compile, ctrl,

      compile = function (template) {
        el = $compile(template)($scope);
        input = el.children();
        ctrl = input.controller('dzInputTime');
      },

      sendKey = function (keyCode, e) {
        ctrl.handleKeydown(angular.extend({}, {
          keyCode: keyCode,
          stopImmediatePropagation: function () {},
          preventDefault: function () {}
        }, e));
      },

      TEMPLATE = ''
        + '<div>'
        + '   <input dz-input-time format="H:mm" ng-model="date" />'
        + '</div>';

    beforeEach(inject(function (_$compile_, $rootScope, _$timeout_) {
      $compile = _$compile_;
      $timeout = _$timeout_;
      $scope = $rootScope.$new();
      $scope.date = new Date(1970, 0, 1, 10, 5, 0);
      compile(TEMPLATE);
    }));

    describe('unit selection', function () {
      var timeParser;

      beforeEach(inject(function (dzInputTimeParser) {
        timeParser = dzInputTimeParser;
        spyOn(ctrl, '$$resetSelection').and.callThrough();
        spyOn(timeParser, 'getUnitContainingCursor').and.callThrough();
        spyOn(ctrl, '$$setSelection');
      }));

      afterEach(function () {
        $timeout.flush();
        expect(ctrl.$$resetSelection).toHaveBeenCalled();
        expect(timeParser.getUnitContainingCursor).toHaveBeenCalled();
        expect(ctrl.$$setSelection).toHaveBeenCalled();
      });

      it('should respond to click', function () {
        input.triggerHandler('click');
      });

      it('should respond to focus', function () {
        input.triggerHandler('focus');
      });
    });

    describe('keyboard shortcuts', function () {
      var prepare, unit, ngModel;

      prepare = function () {
        inject(function (dzInputTimeUnits) {
          ngModel = input.controller('ngModel');
          unit = dzInputTimeUnits.minute;
          // select the last unit
          input[0].selectionStart
            = input[0].selectionEnd
            = input.val().length;
          input.triggerHandler('click');
          $timeout.flush();
        });
      };

      it('should increment when pressing the up arrow', function () {
        // Arrange
        prepare();
        spyOn(unit, 'increment').and.callThrough();
        spyOn(ngModel, '$render');

        // Act
        sendKey(KEYS.UP);

        // Assert
        expect(unit.increment).toHaveBeenCalled();
        expect(ngModel.$render).toHaveBeenCalled();
      });

      it('should decrement when pressing the down arrow', function () {
        // Arrange
        prepare();
        spyOn(unit, 'decrement').and.callThrough();
        spyOn(ngModel, '$render');

        // Act
        sendKey(KEYS.DOWN);

        // Assert
        expect(unit.decrement).toHaveBeenCalled();
        expect(ngModel.$render).toHaveBeenCalled();
      });

      it('should handle output length increases', function () {
        // Arrange
        $scope.date = new Date(1970, 0, 1, 9, 0, 0);
        compile(''
          + '<div>'
          + '  <input dz-input-time format="H" ng-model="date" />'
          + '</div>');
        prepare();
        spyOn(ctrl, '$$setSelection');

        // Act
        sendKey(KEYS.UP);

        // Assert
        expect(ctrl.$$setSelection).toHaveBeenCalledWith(0, 2);
      });

      it('should handle output length decreases', function () {
        // Arrange
        $scope.date = new Date(1970, 0, 1, 10, 0, 0);
        compile(''
          + '<div>'
          + '  <input dz-input-time format="H" ng-model="date" />'
          + '</div>');
        prepare();
        spyOn(ctrl, '$$setSelection');

        // Act
        sendKey(KEYS.DOWN);

        // Assert
        expect(ctrl.$$setSelection).toHaveBeenCalledWith(0, 1);
      });

      it('should move selection when pressing the right arrow', function () {
        // Arrange
        prepare();
        spyOn(ctrl, 'moveRight');

        // Act
        sendKey(KEYS.RIGHT);

        // Assert
        expect(ctrl.moveRight).toHaveBeenCalled();
      });

      it('should move selection when pressing the left arrow', function () {
        // Arrange
        prepare();
        spyOn(ctrl, 'moveLeft');

        // Act
        sendKey(KEYS.LEFT);

        // Assert
        expect(ctrl.moveLeft).toHaveBeenCalled();
      });
    });

    describe('number entry', function () {
      beforeEach(function () {
        // select the last unit
        input[0].selectionStart
          = input[0].selectionEnd
          = input.val().length;
        input.triggerHandler('click');
        $timeout.flush();
      });

      it('should start fresh', function () {
        // Arrange
        $scope.date = new Date(1970, 0, 1, 0, 15, 0);
        $scope.$apply();

        // Arrange/Act
        sendKey('5'.charCodeAt(0));

        // Assert
        expect($scope.date.getMinutes()).toEqual(5);
      });

      it('should write right to left', function () {
        // Arrange/Act
        sendKey('5'.charCodeAt(0));
        sendKey('5'.charCodeAt(0));

        // Assert
        expect($scope.date.getMinutes()).toEqual(55);
      });

      it('should reset after 2s', function () {
        // Arrange/Act
        sendKey('5'.charCodeAt(0));
        $timeout.flush(2000);
        sendKey('5'.charCodeAt(0));

        // Assert
        expect($scope.date.getMinutes()).toEqual(5);
      });

      it('should prevent default', function () {
        // Arrange
        var e = {
          preventDefault: function () {},
          stopImmediatePropagation: function () {}
        };

        spyOn(e, 'preventDefault');
        spyOn(e, 'stopImmediatePropagation');

        // Act
        sendKey('5'.charCodeAt(0), e);

        // Assert
        expect(e.preventDefault).toHaveBeenCalled();
        expect(e.stopImmediatePropagation).toHaveBeenCalled();
      });

      it('should reselect the correct unit', function () {
        // Arrange
        spyOn(ctrl, '$$setSelection').and.callThrough();
        $scope.date = new Date(1970, 0, 1, 0, 15, 0);
        $scope.$apply();

        // Arrange/Act
        sendKey('5'.charCodeAt(0));

        // Assert
        expect(ctrl.$$setSelection).toHaveBeenCalledWith(2, 4);
      });

      it('should update the value in the text box', function () {
        // Arrange
        $scope.date = new Date(1970, 0, 1, 0, 15, 0);
        $scope.$apply();

        // Arrange/Act
        sendKey('5'.charCodeAt(0));

        // Assert
        expect(input.val()).toEqual('0:05');
      });
    });
  });
});