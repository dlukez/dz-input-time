(function () {
  'use strict';

  var timeUnitsFactory, timeParserFactory, timeDirective,

    RESET_KEY_DELAY_MS = 2000,

    KEYS = {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      TAB: 9
    };

  timeUnitsFactory = [function () {
    return {
      '24hour': {
        increment: function (date) {
          var hours = date.getHours();

          // we don't want to change the day
          if (hours === 23) {
            hours -= 24;
          }

          date.setHours(hours + 1);
        },
        decrement: function (date) {
          var hours = date.getHours();

          // we don't want to change the day
          if (hours === 0 ) {
            hours += 24;
          }

          date.setHours(hours - 1);
        },
        set: function (date, hours) {
          var result = true;

          if (hours < 0 || hours > 23) {
            hours = 0;
            result = false;
          }

          date.setHours(hours);

          return result;
        }
      },

      '12hour': {
        increment: function (date) {
          var hours = date.getHours();

          // we don't want to change the am/pm
          if (hours === 11 || hours === 23) {
            hours -= 12;
          }

          date.setHours(hours + 1);
        },
        decrement: function (date) {
          var hours = date.getHours();

          // we don't want to change the am/pm
          if (hours === 0 || hours === 12) {
            hours += 12;
          }

          date.setHours(hours - 1);
        },
        set: function (date, hours) {
          var result = true;

          if (hours < 1 || hours > 11) {
            hours = 0;
            result = false;
          }

          date.setHours(hours);

          return result;
        }
      },

      minute: {
        increment: function (date) {
          var minutes = date.getMinutes();

          // we don't want to change the hour
          if (minutes === 59) {
            minutes -= 60;
          }

          this.set(date, minutes + 1);
        },
        decrement: function (date) {
          var minutes = date.getMinutes();

          // we don't want to change the hour
          if (minutes === 0) {
            minutes += 60;
          }

          this.set(date, minutes - 1);
        },
        set: function (date, minutes) {
          var result = true;

          if (minutes < 0 || minutes >= 60) {
            minutes = 0;
            result = false;
          }

          date.setMinutes(minutes);

          return result;
        }
      },

      ampm: {
        toggle: function (date) {
          var hour = date.getHours();
          if (hour > 12) {
            date.setHours(hour - 12);
          } else {
            date.setHours(hour + 12);
          }
        },
        increment: function (date) { this.toggle(date); },
        decrement: function (date) { this.toggle(date); }
      }
    };
  }];

  timeParserFactory = ['dzInputTimeUnits', 'dateFilter', function (timeUnits, dateFilter) {
    var GRAMMAR = {
      'hh' : { pattern: /0[0-9]|1[0-2]/          , unit: timeUnits['12hour'] },
      'h'  : { pattern: /0[0-9]|1[0-2]|[1-9]/    , unit: timeUnits['12hour'] },
      'HH' : { pattern: /[0-1][0-9]|2[0-3]/      , unit: timeUnits['24hour'] },
      'H'  : { pattern: /[0-1][0-9]|2[0-3]|[0-9]/, unit: timeUnits['24hour'] },
      'mm' : { pattern: /[0-5][0-9]/             , unit: timeUnits.minute },
      'm'  : { pattern: /[0-5][0-9]|[0-9]/       , unit: timeUnits.minute },
      'ss' : { pattern: /[0-5][0-9]/             , unit: timeUnits.second },
      's'  : { pattern: /[0-5][0-9]|[0-9]/       , unit: timeUnits.second },
      'a'  : { pattern: /AM|PM/                  , unit: timeUnits.ampm   },
    };

    // modified from http://stackoverflow.com/a/2188651
    return {
      parse: function (timeString) {
        var match, hours, minutes, isPm, date;

        if (!timeString) { return null; }

        match = timeString.match(/(\d\d?)(:?(\d\d))?\s*(p?)/i);
        if (match == null) { return null; }

        isPm = match[4];
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[3], 10) || 0;

        if (hours == 12 && !isPm) {
          hours = 0;
        }
        else {
          hours += (hours < 12 && isPm)? 12 : 0;
        }

        date = new Date(1970, 0, 1);
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(0, 0);
        return date;
      },

      /**
       * Finds the start and end index of the time string
       * unit containing the given position.
       * Used for selecting the relevant time unit in
       * a text input (hour, minute, am/pm).
       */
      getUnitContainingCursor: function (pos, format, value) {
        var formatMatch, token, output, nextStart,
          selection = { start: 0, end: 0 },
          regex = new RegExp(Object.keys(GRAMMAR).join('|'), 'i');

        // search for each date element in the format string.
        // handles the case where pos is at the end of the string
        while ((formatMatch = regex.exec(format))) {
          token = GRAMMAR[formatMatch[0]];
          output = dateFilter(value, formatMatch[0]);
          nextStart = selection.end + formatMatch.index;

          // handle the case where pos is in between two units
          if (pos < nextStart) {
            break;
          }

          // move the selection to this block
          selection.start = nextStart;
          selection.end   = selection.start + output.length;
          selection.unit  = token.unit;

          // handles the case where pos is within the time element
          if (pos >= selection.start &&
              pos <  selection.end) {
            break;
          }

          // remove the first portion of the string
          format = format.substr(formatMatch.index + formatMatch[0].length);
        }

        return selection;
      }
    };
  }];

  timeDirective = ['dateFilter', 'dzInputTimeParser', '$timeout', function (dateFilter, timeParser, $timeout) {
    return {
      scope: {
        time: '=ngModel'
      },
      controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
        var selection, lastCh, resetKeyTimeoutPromise,
          ctrl = this;

        ctrl.options = {
          format: $attrs.format || 'hh:mm a'
        };

        ctrl.refocus = function () {
          $timeout(function () {
            ctrl.$$resetSelection($element[0].selectionStart);
          }, 0, false);
        };

        ctrl.$$resetSelection = function (cursorPosition) {
          selection = timeParser.getUnitContainingCursor(
            cursorPosition,
            ctrl.options.format,
            $scope.time);

          ctrl.$$setSelection(selection.start, selection.end);
        };

        ctrl.$$setSelection = function (start, end) {
          $element[0].selectionStart = start;
          $element[0].selectionEnd = end;
        };

        ctrl.moveRight = function () {
          var
            count = 0,
            currentUnit = selection.unit;
          do {
            ctrl.$$resetSelection(selection.end + count);
            count++;
          } while (selection.end + count <= $element.val().length
            && selection.unit === currentUnit);
        };

        ctrl.moveLeft = function () {
          var
            count = 0,
            currentUnit = selection.unit;
          do {
            ctrl.$$resetSelection(selection.start - count);
            count++;
          } while (selection.start - count >= 0
            && selection.unit === currentUnit);
        };

        ctrl.$$resetLastKey = function () {
          lastCh = null;
        };

        ctrl.handleKeydown = function (e) {
          var ch;

          switch (e.keyCode) {
            case KEYS.UP:
              $scope.time = new Date($scope.time);
              selection.unit.increment($scope.time);
              $scope.$apply();
              ctrl.$$resetSelection(selection.start);
              break;
            case KEYS.DOWN:
              $scope.time = new Date($scope.time);
              selection.unit.decrement($scope.time);
              $scope.$apply();
              ctrl.$$resetSelection(selection.start);
              break;
            case KEYS.RIGHT:
              ctrl.moveRight();
              break;
            case KEYS.LEFT:
              ctrl.moveLeft();
              break;
          }

          if (e.keyCode !== KEYS.TAB) {
            e.preventDefault();
            e.stopImmediatePropagation();
          }

          ch = String.fromCharCode(e.keyCode);
          if (/([AaPp0-9])/.test(ch)) {
            if (!lastCh) {
              lastCh = '';
            }
            $scope.time = new Date($scope.time);
            lastCh = selection.unit.set($scope.time, lastCh + ch)
              ? ch
              : null;
            $scope.$apply();
            ctrl.$$resetSelection(selection.start);
            if (resetKeyTimeoutPromise) {
              $timeout.cancel(resetKeyTimeoutPromise);
            }
            resetKeyTimeoutPromise = $timeout(ctrl.$$resetLastKey,
              RESET_KEY_DELAY_MS, false);
          } else {
            lastCh = null;
          }
        };
      }],
      require: ['dzInputTime', 'ngModel'],
      link: function ($scope, $element, $attrs, ctrls) {
        var
          ctrl = ctrls[0],
          ngModel = ctrls[1];

        ngModel.$formatters.push(function (modelValue) {
          return dateFilter(modelValue, ctrl.options.format);
        });

        // we have no support for parsing right now...
        // ngModel.$parsers.push(function (viewValue) {
        //   return timeParser.parse(viewValue);
        // });

        // handle keyboard shortcuts
        $element.on('keydown', ctrl.handleKeydown);

        // when the cursor changes position,
        // reselect the correct unit
        $element.on('click focus', ctrl.refocus);
      }
    };
  }];

  angular.module('dz.inputTime', [])
    .factory('dzInputTimeUnits', timeUnitsFactory)
    .factory('dzInputTimeParser', timeParserFactory)
    .directive('dzInputTime', timeDirective);

})();