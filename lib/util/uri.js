"use strict";

var URI = require("urijs");
var path = require("path");

var rIsRelative = /^\.{1,2}/;

function join() {
  var fragments = Array.prototype.slice.call(arguments);
  var uri = new URI(fragments.filter(function(fragment) {
    if (fragment) {
      return fragment;
    }
  }).join("/"));
  return uri.normalizePath().toString();
}

function normalize(uri, sep) {
  uri = uri.replace(/[\/\\]+/g, sep || path.sep);
  uri = new URI({
    path: uri
  });
  return uri.normalizePath().toString();
}

// convenience method for normalizing system paths
normalize.system = function(uri) {
  return normalize(uri, path.sep);
};

// convenience method for normalizing web paths
normalize.web = function(uri) {
  return normalize(uri, "/");
};

function isRelative(uri) {
  return rIsRelative.test(uri);
}

module.exports = {
  join: join,
  normalize: normalize,
  isRelative: isRelative,
  URI: URI
};
