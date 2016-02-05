"use strict";

var fs = require("fs-extra");
var path = require("path");
var unquote = require("../util/unquote");

var AssetsCollection = require("./AssetsCollection");

// TODO - doc
function Assets(eyeglass, sass) {
  this.sassUtils = require("node-sass-utils")(sass);
  this.eyeglass = eyeglass;
  // create a master collection
  this.collection = new AssetsCollection();
}

// TODO - doc
Assets.prototype.asAssetImport = function(name) {
  return this.collection.asAssetImport(name);
};

// TODO - doc
Assets.prototype.addSource = function(src, opts) {
  return this.collection.addSource(src, opts);
};

// TODO - doc
Assets.prototype.export = function(src, opts) {
  var assets = new AssetsCollection();
  return assets.addSource(src, opts);
};

// TODO - doc - this function is way too big...
Assets.prototype.resolveAsset = function(registeredAssetsMap, relativePathString, cb) {
  var options = this.eyeglass.options.eyeglass;
  var assets = this.eyeglass.assets;

  this.sassUtils.assertType(relativePathString, "string");
  relativePathString = unquote(relativePathString.getValue());

  var uriFragments = /^([^\?#]+)(\?[^#]*)?(#.*)?/.exec(relativePathString);
  uriFragments = {
    path: uriFragments[1],
    search: uriFragments[2] || "",
    hash: uriFragments[3] || ""
  };

  var data = resolveAssetDefaults.call(this, registeredAssetsMap, uriFragments.path);

  if (data) {
    var uri = data.coerce.get("uri");
    var filepath = data.coerce.get("filepath");
    var fullUri = httpJoin(
      // only prepend the httpRoot if !relativeTo
      options.assets.relativeTo ? "/" : options.httpRoot,
      options.assets.httpPrefix,
      uri
    );

    assets.resolve(filepath, fullUri, function(error, assetUriInfo) {

      if (error) {
        cb(error);
      } else {
        // handle a string here?
        var finalUri = assetUriInfo.path;
        if (options.assets.relativeTo) {
          finalUri = path.relative(options.assets.relativeTo, assetUriInfo.path);
        }
        // if a query param was specified, append it to the uri query
        if (assetUriInfo.query) {
          uriFragments.search = (uriFragments.search ? "&" : "?") + assetUriInfo.query;
        }

        // append the fragments back into the final uri
        finalUri += uriFragments.search + uriFragments.hash;

        assets.install(filepath, assetUriInfo.path, function(installError, newFilepath) {
          if (installError) {
            cb(installError);
          } else {
            cb(null, finalUri, newFilepath);
          }
        });
      }
    });
  } else {
    cb(new Error("Asset not found: " + uriFragments.path));
  }
};

// TODO - doc
Assets.prototype.resolve = function(assetFile, assetUri, cb) {
  cb(null, {
    path: assetUri
  });
};

// TODO - doc
Assets.prototype.resolver = function(resolver) {
  var oldResolver = this.resolve;
  this.resolve = function(assetFile, assetUri, cb) {
    resolver(assetFile, assetUri, oldResolver, cb);
  };
};

// TODO - doc
Assets.prototype.install = function(assetFile, assetUri, cb) {
  var options = this.eyeglass.options.eyeglass;
  var httpRoot = options.httpRoot;
  if (options.buildDir) {
    if (assetUri.indexOf(httpRoot) === 0) {
      assetUri = assetUri.replace(httpRoot, "");
    }

    // TODO - create a URI helper to normalize this
    if (path.sep !== "/") {
      assetUri = assetUri.split("/").join(path.sep);
    }

    var dest = path.join(options.buildDir, assetUri);
    fs.copy(assetFile, dest, function(error) {
      if (error) {
        cb(error);
      } else {
        cb(null, dest);
      }
    });
  } else {
    cb(null, assetFile);
  }
};

// TODO - doc
Assets.prototype.installer = function(installer) {
  var oldInstaller = this.install;
  this.install = function(assetFile, assetUri, cb) {
    installer(assetFile, assetUri, oldInstaller, cb);
  };
};

function resolveAssetDefaults(registeredAssetsMap, relativePath) {
  registeredAssetsMap = this.sassUtils.handleEmptyMap(registeredAssetsMap);
  this.sassUtils.assertType(registeredAssetsMap, "map");

  var registeredAssets = this.sassUtils.castToJs(registeredAssetsMap);

  var appAssets = registeredAssets.coerce.get(null);
  if (appAssets) {
    // XXX sassUtils.assertType(appAssets, "map");
    var appAsset = appAssets.coerce.get(relativePath);
    if (appAsset) {
      return appAsset;
    }
  }

  var segments = relativePath.split("/");
  var moduleName = segments.shift();
  var moduleRelativePath = segments.join("/");
  var moduleAssets = registeredAssets.coerce.get(moduleName);
  if (moduleAssets) {
    // XXX sassUtils.assertType(moduleAssets, "map");
    return moduleAssets.coerce.get(moduleRelativePath);
  }
}

// TODO - move to URI helper or something...
function httpJoin() {
  var SEP = "/";
  var args = Array.prototype.slice.call(arguments);

  // with all the arguments...
  // split the argument on the OS separator
  // then merge all the fragments with forward-slash
  // and finally strip out any multi-slash instances
  return args.reduce(function(fragments, arg) {
    return fragments.concat((arg || "").split(path.sep));
  }, []).join(SEP).replace(/\/+/, SEP);
}

module.exports = Assets;
