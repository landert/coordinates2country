var calculateDistance, cca3, countries, countryByCca3, createPolygon, data, dataPath, deg2rad, feature, file, fs, geoData, k, len, pip, pointInBoundingBox, pointToCountry, ref, ref1, ref2;

fs = require("fs");

countries = require("./lib/countries");

pip = require("point-in-polygon");

createPolygon = function(type, coordinates) {
  var i, j, k, l, ref, ref1, res;
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
  for (i = k = 0, ref = coordinates.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
    for (j = l = 0, ref1 = coordinates[i].length; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
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
  var country, k, len;
  cca3 = cca3.toLowerCase();
  for (k = 0, len = countries.length; k < len; k++) {
    country = countries[k];
    if (cca3 === country.cca3.toLowerCase()) {
      return country;
    }
  }
  return null;
};

pointToCountry = function(longitude, latitude, findNearest) {
  var cca3, data, dist, k, len, minCca3, minDist, ref, vertex;
  if (findNearest == null) {
    findNearest = false;
  }
  for (cca3 in geoData) {
    data = geoData[cca3];
    if (pointInBoundingBox(longitude, latitude, data)) {
      if (pip([longitude, latitude], data.vertices)) {
        return countryByCca3(cca3);
      }
    }
  }
  if (!findNearest) {
    return null;
  }
  minDist = Number.MAX_SAFE_INTEGER;
  minCca3 = null;
  for (cca3 in geoData) {
    data = geoData[cca3];
    ref = data.vertices;
    for (k = 0, len = ref.length; k < len; k++) {
      vertex = ref[k];
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

dataPath = __dirname + "/lib/countries/data";

geoData = {};

ref = fs.readdirSync(dataPath);
for (k = 0, len = ref.length; k < len; k++) {
  file = ref[k];
  if (!/^[a-z]{3}\.geo\.json$/.test(file)) {
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
      cca3 = file.substring(0, 3);
      geoData[cca3] = createPolygon(feature.geometry.type, feature.geometry.coordinates);
      break;
    default:
      throw new Error("Unsupported geometry: " + feature.geometry.type);
  }
}

module.exports = pointToCountry;
