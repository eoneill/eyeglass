"use strict";

var AssetsSource = require("./AssetsSource");
var tmpl = require("es6-template-strings");

function AssetsCollection() {
  this.sources = [];
}

AssetsCollection.prototype.addSource = function(src, opts) {
  this.sources.push(new AssetsSource(src, opts));
  return this;
};

AssetsCollection.prototype.asAssetImport = function (name) {
  //console.log("[sources]", sources);
  // builds the scss to register all the assets
  // this will look something like...
  //  @import "eyeglass/assets";
  //  @include asset-register-all("moduleName", (
  //    "path/to/foo.png": (
  //      filepath: "/absolute/moduleName/path/to/foo.png",
  //      uri: "moduleName/path/to/foo.png"
  //    )
  //  ));
  return this.sources.reduce(function(str, source) {
    //console.log("[source]", source);
    // get the assets for the entry
    var assets = source.getAssets(name);
    var moduleName = (quoted(assets.moduleName) || "null");
    var registrationStr = "@include asset-register-all(" + moduleName + ", (\n  ${map}\n));";

    // reduce the assets into a Sass map string
    var sassMapString = assets.files.map(function(asset) {
      return tmpl('"${name}": (\n    filepath: "${path}",\n    uri: "${uri}")', {
        name: asset.name,
        // escape all back-slashes for Sass string
        //  "C:\foo\bar.png" -> "C:\\foo\\bar.png"
        path: asset.path.replace(/\\/g, "\\\\"),
        uri: asset.uri
      });
    }).join(",\n  ");

    return str += "\n" + tmpl(registrationStr, {
      map: sassMapString
    });
  }, '@import "eyeglass/assets";');
};

module.exports = AssetsCollection;

// TODO - move to string utils
function quoted(string) {
  return string ? '"' + string + '"' : string;
}
