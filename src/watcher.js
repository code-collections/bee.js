"use strict";

var evaluate = require('./eval.js')
  , utils = require('./utils.js')
  , parse = require('./parse.js').parse
  ;

var extend = utils.extend;

//表达式解析
function exParse() {
  var summary
    , dir = this.dir
    ;

  dir.parse();

  summary = evaluate.summary(dir.ast);
  extend(dir, summary);
}

function Watcher(vm, dir) {
  var path, scope = vm, curVm, localKey, willUpdate, ass, paths;

  this.dir = dir;
  this.vm = vm;

  this.val = NaN;

  exParse.call(this, dir.path);

  for(var i = 0, l = this.dir.paths.length; i < l; i++) {
    paths = utils.parseKeyPath(this.dir.paths[i]);
    localKey = paths[0];

    while(scope) {
      curVm = scope;
      ass = scope._assignments;

      if(ass && ass.length) {
        //具名 repeat
        if(ass[0] === localKey) {
          if(paths.length == 1) {
            paths[0] = '$data';
          }else{
            paths.shift();
          }
          break;
        }else if(localKey === '$index' || localKey === '$parent') {
          break;
        }
      }else if(localKey in scope){
        break;
      }

      //向上查找
      scope = scope.$parent;
    }
    if(dir.watch) {
      path = paths.join('.');
      curVm._watchers[path] = curVm._watchers[path] || [];
      curVm._watchers[path].push(this);
    }
  }

  //没有变量 / 变量不在当前作用域的表达式立即求值
  //for(var i = 0, l = this.dir.locals.length; i < l; i++) {
  //  if(utils.isObject(this.vm.$data) && (this.dir.locals[i] in this.vm.$data)) {
  //    break;
  //  }
  //}
  //if(i == l) {
  //  willUpdate = true;
  //}

  //if(willUpdate || this.vm._isRendered) {
    this.update();
  //}
}

function unwatch (vm, key, callback) {
  var summary;
  try {
    summary = evaluate.summary(parse(key))
  }catch (e){
    e.message = 'SyntaxError in "' + key + '" | ' + e.message;
    console.error(e);
  }
  summary.paths.forEach(function(path) {

    var watchers = vm._watchers[path] || [], update;

    for(var i = watchers.length - 1; i >= 0; i--){
      update = watchers[i].dir.update;
      if(update === callback || update._originFn === callback){
        watchers.splice(i, 1);
      }
    }
  })
}

function addWatcher(dir) {
  if(dir.path) {
    return new Watcher(this, dir);
  }
}

Watcher.unwatch = unwatch;
Watcher.addWatcher = addWatcher;

function watcherUpdate (val) {
  try{
    this.dir.update(val, this.val);
    this.val = val;
  }catch(e){
    console.error(e);
  }
}

extend(Watcher.prototype, {
  //表达式执行
  update: function() {
    var that = this
      , newVal
      ;

    newVal = this.dir.getValue(this.vm);

    if(newVal && newVal.then) {
      //a promise
      newVal.then(function(val) {
        watcherUpdate.call(that, val);
      });
    }else{
      watcherUpdate.call(this, newVal);
    }

  }
});

module.exports = Watcher
