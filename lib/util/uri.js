"use strict";

var URI = require("urijs");

function join() {
  var fragments = Array.prototype.slice.call(arguments);
  var uri = new URI(fragments.filter(function(fragment) {
    if (fragment) {
      return fragment;
    }
  }).join("/"));
  uri.normalizePath();
  return uri.toString();
}

function normalize(uri, sep) {
  uri = new URI(uri.replace(/[\/\\]+/g, sep || "/"));
  uri.normalizePath();
  return uri.toString();
}

module.exports = {
  join: join,
  normalize: normalize,
  URI: URI
};
