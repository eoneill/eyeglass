"use strict";

var rUnquote = /^("|')(.*)\1$/;

function unquote(string) {
  return string.replace(rUnquote, "$2");
}

function quote(string) {
  return typeof string === "string" ? '"' + unquote(string) + '"' : string;
}

module.exports = {
  quote: quote,
  unquote: unquote
};
