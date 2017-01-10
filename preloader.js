(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Preloader = factory());
}(this, (function () { 'use strict';

function get(file, done) {
  var x = new XMLHttpRequest();
  x.onload = function () {
    return done(x.response);
  };
  x.onprogress = prog.thunk;
  x.open("GET", file);
  x.send();
}

var prog = {
  bar: null,
  files: {},
  loaded: 0,
  total: 0,

  hide: function hide() {
    if (prog.bar) {
      prog.bar.style.display = "none";
    }
  },

  thunk: function thunk(evt) {
    var file = evt.target.responseURL || evt.target.currentSrc;
    if (file) {
      if (!prog.files[file]) {
        prog.files[file] = {};
      }
      var f = prog.files[file];
      if (typeof evt.loaded === "number") {
        f.loaded = evt.loaded;
        f.total = evt.total;
      } else {
        var bs = evt.srcElement.buffered;
        var min = Number.MAX_VALUE,
            max = Number.MIN_VALUE;
        for (var i = 0; i < bs.length; ++i) {
          min = Math.min(min, bs.start(i));
          max = Math.max(max, bs.end(i));
        }
        f.loaded = 1000 * max;
        f.total = 1000 * evt.srcElement.duration;
      }
    }

    var total = 0,
        loaded = 0;
    for (var key in prog.files) {
      var _f = prog.files[key];
      loaded += _f.loaded;
      total += _f.total;
    }

    prog.loaded = loaded;
    prog.total = total;

    if (!prog.bar) {
      prog.bar = document.querySelector("progress");
    }

    if (prog.bar && total) {
      prog.bar.max = total;
      prog.bar.value = loaded;
    }
  }
};
var curScripts = document.querySelectorAll("script");
var curScript = curScripts[curScripts.length - 1];
var scripts = [];

function installScripts() {
  if (scripts.length > 0 && scripts[0] !== undefined) {
    var s = document.createElement("script"),
        file = scripts.shift();
    s.type = "text/javascript";
    if (window.DEBUG) {
      s.src = file;
      s.onload = installScripts;
    } else {
      s.innerHTML = file;
      setTimeout(installScripts);
    }
    document.body.appendChild(s);
  }
}

function getNextScript(file, i) {
  get(file, function (contents) {
    if (window.DEBUG) {
      scripts[i] = file;
    } else {
      scripts[i] = contents;
    }
    if (document.readyState !== "loading") {
      installScripts();
    } else {
      var existing = document.onreadystatechange || function () {};
      document.onreadystatechange = function (evt) {
        existing(evt);
        installScripts(evt);
      };
    }
  });
}

if (curScript && curScript.dataset.files) {
  curScript.dataset.files.split(",").forEach(getNextScript);
}

return prog;

})));