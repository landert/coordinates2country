var c2c, country;

c2c = require("./index.js");

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
