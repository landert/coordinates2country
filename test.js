var c2c, country, ref, ref1;

if (/\.js$/.test(__filename)) {
  c2c = require("./index.js");
} else {
  c2c = require("./index.coffee");
}

country = c2c(13.377633, 49.747487);

if (country.cca3 !== "CZE") {
  throw new Error("Expected country 'CZE', actual country '" + country.cca3 + "'.");
}

country = c2c(14.808062, 42.695307);

if (country !== null) {
  throw new Error("Expected no country, found country '" + country.cca3 + "'.");
}

country = c2c(14.808062, 42.695307, true);

if (country.cca3 !== "ITA") {
  throw new Error("Expected country 'ITA', actual country '" + country.cca3 + "'.");
}

country = c2c(-122.163351, 36.797101, true);

if (country.cca3 !== "USA") {
  throw new Error("Expected country 'USA', actual country '" + country.cca3 + "'.");
}

if (((ref = country.subcountry) != null ? ref.cca3 : void 0) !== "USA-CA") {
  throw new Error("Expected sub-country 'USA-CA', actual sub-country '" + ((ref1 = country.subcountry) != null ? ref1.cca3 : void 0) + "'.");
}