var test = require('tape');
var Bee = require('../');
var $ = require('jquery')
require("es6-promise").polyfill();

if(typeof window === 'undefined') {
  $ = $(Bee.doc.parentWindow)
}

test('filter', function(t) {
  var Ant = Bee.extend({
    $tpl: '<div><span b-content="filterTest"></span></div>'
  }, {
    filters: {
      filter1: function(arg) {
        return (arg  + 1) || '';
      },
      filter2: function(arg, arg1, arg2) {
        return arg + arg1 + arg2;
      }
    }
  })
  var bee = new Ant({
    $data: {
      filterTest: '{{arg | filter1}}'
    }
  })

  t.test('Bee.filter', function(t) {
    t.plan(2)
    var key = Math.random() + '';
    var data = {name: "Bee"}
    var testfilter = function(name) {
      t.equal(name, data.name)
      return key;
    }

    Bee.filter('test', testfilter)

    var bee = new Bee('<span>{{ name | test }}</span>', {
      $data: data
    })

    t.equal($(bee.$el).text(), key)
  })

  t.test('1 arg sync filter', function(t) {
    t.equal($(bee.$el).text(), '')

    bee.$set('arg', 1)
    t.equal($(bee.$el).text(), '2')

    t.end()
  })

  t.test('multi arg sync filter', function(t){
    bee.$set({'filterTest': '{{ arg | filter2 : arg1 : arg2 }}', arg1: 2, arg2: 4})
    t.equal($(bee.$el).text(), '7')

    bee.$set('arg', 2)
    t.equal($(bee.$el).text(), '8')

    bee.$set('arg1', 3)
    t.equal($(bee.$el).text(), '9')

    bee.$set('arg2', 5)
    t.equal($(bee.$el).text(), '10')

    t.end()
  })

  t.test('multi sync filter', function(t){
    bee.$set({'filterTest': '{{ arg | filter1 | filter2 : arg1 : arg2 }}', arg:1, arg1: 2, arg2: 4})

    t.equal($(bee.$el).text(), '8')

    bee.$set('arg', 2)
    t.equal($(bee.$el).text(), '9')

    bee.$set('arg1', 3)
    t.equal($(bee.$el).text(), '10')

    bee.$set('arg2', 5)
    t.equal($(bee.$el).text(), '11')

    t.end()
  })

  t.test('multi sync filter 2', function(t){
    Ant.filter('filter3', function(arg) {
      return arg * 2
    })
    bee.$set({'filterTest': '{{ arg | filter2 : arg1 : arg2 | filter3}}', arg:1, arg1: 2, arg2: 4})

    t.equal($(bee.$el).text(), '14')

    bee.$set('arg', 2)
    t.equal($(bee.$el).text(), '16')

    bee.$set('arg1', 3)
    t.equal($(bee.$el).text(), '18')

    bee.$set('arg2', 5)
    t.equal($(bee.$el).text(), '20')

    t.end()
  })

  t.test('promise in filter', function(t) {
    var Cicada = Ant.extend({}, {
      filters: {
        filter1: function(arg) {
          return new Promise(function(resolve) {
            resolve( (arg  + 1) || '')
          })
        },
        filter2: function(arg, arg1, arg2) {
          return new Promise(function(resolve) {
            resolve( arg + arg1 + arg2 )
          })
        }
      }
    })
    bee = new Cicada({
      $data: {
        filterTest: '{{arg | filter1}}'
      }
    })

    t.test('1 arg async filter', function(t) {
      t.equal($(bee.$el).text(), '')

      bee.$set('arg', 1)
      setTimeout(function() {
        t.equal($(bee.$el).text(), '2')
        t.end()
      }, 100)
    })

    t.test('multi arg async filter', function(t){
      t.test(function(t) {
        bee.$set({'filterTest': '{{ arg | filter2 : arg1 : arg2 }}', arg1: 2, arg2: 4})
        setTimeout(function() {
          t.equal($(bee.$el).text(), '7')
          t.end()
        }, 100)
      })

      t.test(function(t) {
        bee.$set('arg', 2)
        setTimeout(function() {
          t.equal($(bee.$el).text(), '8')
          t.end()
        }, 10)
      })

      t.test(function(t) {
        bee.$set('arg1', 3)
        setTimeout(function() {
          t.equal($(bee.$el).text(), '9')
          t.end()
        }, 10)
      })

      t.test(function(t) {
        bee.$set('arg2', 5)
        setTimeout(function () {
          t.equal($(bee.$el).text(), '10')
          t.end()
        }, 10)
      })

    })

    t.test('multi async filter', function(t){
      bee.$set({'filterTest': '{{ arg | filter1 | filter2 : arg1 : arg2 }}', arg:1, arg1: 2, arg2: 4})
      t.test(function(t) {
        setTimeout(function () {
          t.equal($(bee.$el).text(), '8')
          t.end();
        }, 100)
      })

      t.test(function(t) {
        bee.$set('arg', 2)
        setTimeout(function() {
          t.equal($(bee.$el).text(), '9')
          t.end()
        }, 10)
      })

      t.test(function(t) {
        bee.$set('arg1', 3)
        setTimeout(function() {
          t.equal($(bee.$el).text(), '10')
          t.end()
        }, 10)
      })

      t.test(function(t) {
        bee.$set('arg2', 5)
        setTimeout(function() {
          t.equal($(bee.$el).text(), '11')
          t.end()
        }, 10)
      })

    })


  })

})
