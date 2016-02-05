"use strict";

var URI = require("urijs");

function simpleUri() {
  var fragments = Array.prototype.slice.call(arguments);
  var uri = new URI(fragments.filter(function(fragment) {
    if (fragment) {
      return fragment;
    }
  }).join("/"));
  uri.normalizePath();
  return uri.toString();
}

function normalizeUri(uri, sep) {
  uri = new URI(uri.replace(/[\/\\]+/g, sep || "/"));
  uri.normalizePath();
  return uri.toString();
}

module.exports = {
  simple: simpleUri,
  normalize: normalizeUri,
  URI: URI
};
