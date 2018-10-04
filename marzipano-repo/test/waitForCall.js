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

// waitForCall(spy1, ..., spyN, done) repeatedly polls the given spies until all
// of them have been called at least once, and then calls done. In a test, this
// is faster and more robust than waiting with setTimeout, as it avoids the need
// for a large timeout to prevent slower browsers from flaking out.
function waitForCall() {
  if (arguments.length === 0) {
    throw new Error('waitFor: missing arguments');
  }
  var done = arguments[arguments.length-1];
  var spies = Array.prototype.slice.call(arguments, 0, arguments.length-1);
  var timer = setInterval(function() {
    for (var i = 0; i < spies.length; i++)
    if (!spies[i].called) {
      return;
    }
    clearInterval(timer);
    done();
  }, 10);
}

module.exports = waitForCall;
