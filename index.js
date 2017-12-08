var calculateDistance, countries, countryByCca3, countryCodes, createPolygon, deg2rad, fs, geoData, loadData, pip, pointInBoundingBox, pointToCountry, subcountryCodes;

fs = require("fs");

countries = require("./lib/countries");

pip = require("point-in-polygon");

geoData = {};

countryCodes = [];

subcountryCodes = [];

createPolygon = function(type, coordinates) {
  var i, j, l, m, ref, ref1, res;
  switch (type) {
    case "Polygon":
      coordinates = coordinates;
      break;
    case "MultiPolygon":
      while (coordinates.length > 1) {
        coordinates[0] = coordinates[0].concat(coordinates.pop());
      }
      coordinates = coordinates[0];
  }
  res = {
    vertices: [[0, 0]],
    minLng: coordinates[0][0][0],
    maxLng: coordinates[0][0][0],
    minLat: coordinates[0][0][1],
    maxLat: coordinates[0][0][1]
  };
  for (i = l = 0, ref = coordinates.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
    for (j = m = 0, ref1 = coordinates[i].length; 0 <= ref1 ? m < ref1 : m > ref1; j = 0 <= ref1 ? ++m : --m) {
      res.vertices.push(coordinates[i][j]);
      if (coordinates[i][j][0] < res.minLng) {
        res.minLng = coordinates[i][j][0];
      } else if (coordinates[i][j][0] > res.maxLng) {
        res.maxLng = coordinates[i][j][0];
      }
      if (coordinates[i][j][1] < res.minLat) {
        res.minLat = coordinates[i][j][1];
      } else if (coordinates[i][j][1] > res.maxLat) {
        res.maxLat = coordinates[i][j][1];
      }
    }
    res.vertices.push(coordinates[i][0]);
    res.vertices.push([0, 0]);
  }
  return res;
};

pointInBoundingBox = function(longitude, latitude, box) {
  return ((box.minLng <= longitude && longitude <= box.maxLng)) && ((box.minLat <= latitude && latitude <= box.maxLat));
};

deg2rad = function(degree) {
  return degree * Math.PI / 180;
};

calculateDistance = function(longitude1, latitude1, longitude2, latitude2) {
  var a, c, d, dLat, dLon, earth_radius;
  earth_radius = 6371;
  dLat = deg2rad(latitude2 - latitude1);
  dLon = deg2rad(longitude2 - longitude1);
  a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(latitude1)) * Math.cos(deg2rad(latitude2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  c = 2 * Math.asin(Math.sqrt(a));
  d = earth_radius * c;
  return d;
};

countryByCca3 = function(cca3) {
  var country, l, len;
  cca3 = cca3.toLowerCase();
  for (l = 0, len = countries.length; l < len; l++) {
    country = countries[l];
    if (cca3 === country.cca3.toLowerCase()) {
      return country;
    }
  }
  return null;
};

pointToCountry = function(longitude, latitude, findNearest, subcountryIn) {
  var cca3, cca3Codes, dist, l, len, len1, len2, m, minCca3, minDist, n, ref, vertex;
  if (findNearest == null) {
    findNearest = false;
  }
  if (subcountryIn == null) {
    subcountryIn = null;
  }
  if (subcountryIn) {
    subcountryIn = subcountryIn.toLowerCase();
  }
  cca3Codes = subcountryIn ? subcountryCodes : countryCodes;
  for (l = 0, len = cca3Codes.length; l < len; l++) {
    cca3 = cca3Codes[l];
    if (pointInBoundingBox(longitude, latitude, geoData[cca3])) {
      if (pip([longitude, latitude], geoData[cca3].vertices)) {
        return countryByCca3(cca3);
      }
    }
  }
  if (!findNearest) {
    return null;
  }
  minDist = Number.MAX_SAFE_INTEGER;
  minCca3 = null;
  for (m = 0, len1 = cca3Codes.length; m < len1; m++) {
    cca3 = cca3Codes[m];
    ref = geoData[cca3].vertices;
    for (n = 0, len2 = ref.length; n < len2; n++) {
      vertex = ref[n];
      if (vertex[0] === 0 && vertex[1] === 0) {
        continue;
      }
      dist = calculateDistance(longitude, latitude, vertex[0], vertex[1]);
      if (dist < minDist) {
        minDist = dist;
        minCca3 = cca3;
      }
    }
  }
  if (minCca3) {
    return countryByCca3(minCca3);
  }
  return null;
};

loadData = function(dataPath, isoFn, featureFn) {
  var cca3, data, feature, file, l, len, ref, ref1, ref2, results;
  if (isoFn == null) {
    isoFn = null;
  }
  if (featureFn == null) {
    featureFn = null;
  }
  ref = fs.readdirSync(dataPath);
  results = [];
  for (l = 0, len = ref.length; l < len; l++) {
    file = ref[l];
    if (!/^[a-zA-Z]{2,3}\.geo\.json$/.test(file)) {
      continue;
    }
    data = require(dataPath + "/" + file);
    if ((data != null ? (ref1 = data.features) != null ? ref1.length : void 0 : void 0) !== 1) {
      throw new Error("Unexpected number of features: " + data.features.length);
    }
    feature = data.features.shift();
    if (!((ref2 = feature.geometry) != null ? ref2.type : void 0)) {
      continue;
    }
    switch (feature.geometry.type) {
      case "Polygon":
      case "MultiPolygon":
        cca3 = file.replace(/\..*/, "");
        if (isoFn) {
          cca3 = isoFn(cca3);
        }
        cca3 = cca3.toLowerCase();
        if (cca3.indexOf("-") === -1) {
          countryCodes.push(cca3);
        } else {
          subcountryCodes.push(cca3);
        }
        if (featureFn) {
          featureFn(cca3, feature);
        }
        results.push(geoData[cca3] = createPolygon(feature.geometry.type, feature.geometry.coordinates));
        break;
      default:
        throw new Error("Unsupported geometry: " + feature.geometry.type);
    }
  }
  return results;
};

loadData(__dirname + "/lib/countries/data");

loadData(__dirname + "/lib/world.geo.json/countries/USA", function(iso) {
  return "usa-" + iso;
}, function(iso, feature) {
  return countries.push({
    cca2: iso.toUpperCase().replace("USA-", "US-"),
    cca3: iso.toUpperCase(),
    name: {
      common: feature.properties.name
    }
  });
});

module.exports = function(longitude, latitude, findNearest) {
  var country, k, newCountry, ref, v;
  if (findNearest == null) {
    findNearest = false;
  }
  country = pointToCountry(longitude, latitude, findNearest);
  if ((ref = country != null ? country.cca3 : void 0) !== "USA") {
    return country;
  }
  newCountry = {};
  for (k in country) {
    v = country[k];
    newCountry[k] = v;
  }
  newCountry.subcountry = pointToCountry(longitude, latitude, findNearest, country.cca3) || {};
  return newCountry;
};