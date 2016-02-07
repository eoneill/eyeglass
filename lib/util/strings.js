"use strict";

var rUnquote = /^("|')(.*)\1$/;
var rPlaceholders = /\${([^\}]+)}/g;

function unquote(string) {
  return string.replace(rUnquote, "$2");
}

function quote(string) {
  return typeof string === "string" ? '"' + unquote(string) + '"' : string;
}

function template(tmpl, data) {
  return tmpl.replace(rPlaceholders, function(match, key) {
    return data.hasOwnProperty(key) ? data[key] : match;
  });
}

module.exports = {
  quote: quote,
  unquote: unquote,
  tmpl: template
};
