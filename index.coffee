fs = require "fs"
countries = require "./lib/countries"
pip = require "point-in-polygon"

# geojson coordinates format is [longitude, latitude]
createPolygon = (type, coordinates)->
	switch type
		when "Polygon"
			coordinates = coordinates
		when "MultiPolygon"
			while coordinates.length > 1
				coordinates[0] = coordinates[0].concat coordinates.pop()
			coordinates = coordinates[0]

	res =
		vertices: [[0, 0]]
		minLng: coordinates[0][0][0]
		maxLng: coordinates[0][0][0]
		minLat: coordinates[0][0][1]
		maxLat: coordinates[0][0][1]

	# transforms coordinates according to
	# https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
	for i in [0...coordinates.length]
		for j in [0...coordinates[i].length]
			res.vertices.push coordinates[i][j]

			if coordinates[i][j][0] < res.minLng
				res.minLng = coordinates[i][j][0]
			else if coordinates[i][j][0] > res.maxLng
				res.maxLng = coordinates[i][j][0]

			if coordinates[i][j][1] < res.minLat
				res.minLat = coordinates[i][j][1]
			else if coordinates[i][j][1] > res.maxLat
				res.maxLat = coordinates[i][j][1]

		res.vertices.push coordinates[i][0]
		res.vertices.push [0, 0]

	res

pointInBoundingBox = (longitude, latitude, box)->
	(box.minLng <= longitude <= box.maxLng) and (box.minLat <= latitude <= box.maxLat)

deg2rad = (degree)->
	degree * Math.PI / 180

calculateDistance = (longitude1, latitude1, longitude2, latitude2)->
	earth_radius = 6371

	dLat = deg2rad latitude2 - latitude1
	dLon = deg2rad longitude2 - longitude1

	a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(latitude1)) * Math.cos(deg2rad(latitude2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
	c = 2 * Math.asin(Math.sqrt(a));
	d = earth_radius * c;

	d

countryByCca3 = (cca3)->
	cca3 = cca3.toLowerCase()
	for country in countries
		return country if cca3 is country.cca3.toLowerCase()
	null

pointToCountry = (longitude, latitude, findNearest = false)->
	for cca3, data of geoData when pointInBoundingBox longitude, latitude, data
		return countryByCca3 cca3 if pip [longitude, latitude], data.vertices

	return null unless findNearest

	minDist = Number.MAX_SAFE_INTEGER
	minCca3 = null
	for cca3, data of geoData
		for vertex in data.vertices
			# vertex inserted because of 'pnpoly'
			continue if vertex[0] is 0 and vertex[1] is 0

			dist = calculateDistance longitude, latitude, vertex[0], vertex[1]
			if dist < minDist
				minDist = dist
				minCca3 = cca3

	return countryByCca3 minCca3 if minCca3
	null

dataPath = __dirname + "/lib/countries/data"
geoData = {}
for file in fs.readdirSync dataPath
	continue unless /^[a-z]{3}\.geo\.json$/.test file

	data = require dataPath + "/" + file
	if data?.features?.length isnt 1
		throw new Error("Unexpected number of features: " + data.features.length)

	feature = data.features.shift()
	continue unless feature.geometry?.type

	switch feature.geometry.type
		when "Polygon", "MultiPolygon"
			cca3 = file.substring 0, 3
			geoData[cca3] = createPolygon feature.geometry.type, feature.geometry.coordinates
		else
			throw new Error("Unsupported geometry: " + feature.geometry.type)

module.exports = pointToCountry