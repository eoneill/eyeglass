"use strict";

var fs = require("fs");
var glob = require("glob");
var path = require("path");
var merge = require("lodash.merge");
var uriUtils = require("../util/uri");

var defaultGlobOpts = {
  follow: true,
  nodir: true
};

// TODO - doc
/* class AssetsSource
 *
 * srcPath - directory where assets are sourced.
 * Option: name [Optional] - The logical name of this path entry. When specified,
 *   the source url of an asset in this directory will be of the form
 *   "<name>/path/relativeTo/srcPath.ext".
 * Option: httpPrefix [Optional] - The http prefix where the assets url should be anchored
 *   "url(<httpPrefix>/path/relativeTo/srcPath.ext)". Defaults to "/<name>" or just "/"
 *   when there is no name.
 * Option: pattern [Optional] - A glob pattern that controls what files can be in this asset path.
 *   Defaults to "**\/*".
 * Option: globOpts [Optional] - Options to use for globbing.
 *   See: https://github.com/isaacs/node-glob#options
 */
function AssetsSource(srcPath, options) {
  options = options || {};

  if (existsSync(srcPath) && !fs.statSync(srcPath).isDirectory()) {
    throw new Error("Expected " + srcPath + " to be a directory.");
  }

  this.name = options.name || null;
  this.httpPrefix = options.httpPrefix || this.name;
  this.srcPath = srcPath;
  this.pattern = options.pattern || "**/*";
  this.globOpts = merge(
    {},
    // merge the default options
    defaultGlobOpts,
    // with the custom options
    options.globOpts,
    // but the following cannot be overridden by options.globOpts
    {
      cwd: this.srcPath,
      root: this.srcPath
    }
  );
}

// TODO - replace with fileUtils.existsSync
function existsSync(file) {
  return fs.existsSync(file);
}

function resolveModuleName(name) {
  return this.name || name;
}

// TODO - doc
AssetsSource.prototype.getAssets = function(name) {
  var moduleName = resolveModuleName.call(this, name);
  var files = glob.sync(this.pattern, this.globOpts).map(function(file) {
    // TODO: handle windows error
    var uri = uriUtils.simple(this.httpPrefix, moduleName, file);

    return {
      name: file,
      path: path.join(this.srcPath, file),
      uri: uri
    };
  }.bind(this));

  return {
    moduleName: moduleName,
    files: files
  };
};

// TODO - doc
AssetsSource.prototype.toString = function() {
  return this.srcPath + "/" + this.pattern;
};

module.exports = AssetsSource;
