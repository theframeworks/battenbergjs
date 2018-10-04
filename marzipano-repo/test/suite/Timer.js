/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var assert = require('proclaim');
var sinon = require('sinon');

var Timer = require('../../src/Timer');
var clock = require('../../src/util/clock');
var defer = require('../../src/util/defer');
var waitForCall = require('../waitForCall');

suite('Timer', function() {

  test('start', function(done) {
    var spy = sinon.spy();
    var timer = new Timer({duration: 50});
    timer.addEventListener('timeout', spy);

    var timeBefore = clock();
    assert(!timer.started());
    timer.start();
    assert(timer.started());

    waitForCall(spy, function() {
      var timeAfter = clock();
      assert(!timer.started());
      assert(timeAfter - timeBefore >= 50);
      done();
    });
  });

  test('stop', function(done) {
    var spy = sinon.spy();
    var timer = new Timer({duration: 10});
    timer.addEventListener('timeout', spy);

    assert(!timer.started());
    timer.start();
    assert(timer.started());
    timer.stop();
    assert(!timer.started());

    setTimeout(function() {
      assert(spy.notCalled);
      done();
    }, 50);
  });

  test('reset', function(done) {
    var spy = sinon.spy();
    var timer = new Timer({duration: 100});
    timer.addEventListener('timeout', spy);

    var timeBefore = clock();
    timer.start();

    setTimeout(function() {
      assert(spy.notCalled);
      timer.start();
    }, 50);

    waitForCall(spy, function() {
      var timeAfter = clock();
      assert(!timer.started());
      assert(timeAfter - timeBefore >= 150);
      done();
    });
  });

  test('set duration after start with infinity', function(done) {
    var spy = sinon.spy();
    var timer = new Timer();
    timer.addEventListener('timeout', spy);

    var timeBefore = clock();
    timer.start();

    defer(function() {
      timer.setDuration(50);
    });

    waitForCall(spy, function() {
      var timeAfter = clock();
      assert(timeAfter - timeBefore >= 50);
      done();
    });
  });

  test('set duration when stopped', function(done) {
    var spy = sinon.spy();
    var timer = new Timer({duration: 50});
    timer.addEventListener('timeout', spy);

    assert(timer.duration() === 50);
    timer.setDuration(100);
    assert(timer.duration() === 100);

    var timeBefore = clock();
    timer.start();

    waitForCall(spy, function() {
      var timeAfter = clock();
      assert(timeAfter - timeBefore >= 100);
      done();
    });
  });

  test('increase duration when started', function(done) {
    var spy = sinon.spy();
    var timer = new Timer({duration: 50});
    timer.addEventListener('timeout', spy);

    var timeBefore = clock();
    timer.start();

    defer(function() {
      timer.setDuration(100);
    });

    waitForCall(spy, function() {
      var timeAfter = clock();
      assert(timeAfter - timeBefore >= 100);
      done();
    });
  });

  test('decrease duration when started', function(done) {
    var spy = sinon.spy();
    var timer = new Timer({duration: 100});
    timer.addEventListener('timeout', spy);

    timer.start();

    setTimeout(function() {
      assert(spy.notCalled);
      timer.setDuration(10);
      assert(spy.calledOnce);
      done();
    }, 50);
  });

});
