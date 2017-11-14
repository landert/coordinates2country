c2c = require("./index.js")

country = c2c(13.377633, 49.747487)
if country.cca3 isnt "CZE"
	throw new Error("Expected country 'CZE', actual country '" + country.cca3 + "'.")

country = c2c(14.808062, 42.695307)
if country isnt null
	throw new Error("Expected no country, found country '" + country.cca3 + "'.")

country = c2c(14.808062, 42.695307, true)
if country.cca3 isnt "ITA"
	throw new Error("Expected country 'ITA', actual country '" + country.cca3 + "'.")