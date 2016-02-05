"use strict";

var rUnquote = /^("|')(.*)\1$/;

function unquote(string) {
  return string.replace(rUnquote, "$2");
}

function quote(string) {
  return '"' + unquote(string) + '"';
}

module.exports = {
  quote: quote,
  unquote: unquote
};
