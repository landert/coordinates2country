# coordinates2country
Get country data for geographic coordinates. Can handle "holes" in countries - e.g. San Marino in Italy.

### each country data contains:

 - `name`
 	 - `common` - common name in english
 	 - `official` - official name in english
 	 - `native` - list of all native names
 	 	- key: three-letter ISO 639-3 language code
	 	- value: name object
	 		+ key: official - official name translation
	 		+ key: common - common name translation
 - country code top-level domain (`tld`)
 - code ISO 3166-1 alpha-2 (`cca2`)
 - code ISO 3166-1 numeric (`ccn3`)
 - code ISO 3166-1 alpha-3 (`cca3`)
 - code International Olympic Committee (`cioc`)
 - ISO 4217 currency code(s) (`currency`)
 - calling code(s) (`callingCode`)
 - capital city (`capital`)
 - alternative spellings (`altSpellings`)
 - region
 - subregion
 - list of official languages (`languages`)
 	- key: three-letter ISO 639-3 language code
 	- value: name of the language in english
 - list of name translations (`translations`)
 	- key: three-letter ISO 639-3 language code
 	- value: name object
 		+ key: official - official name translation
 		+ key: common - common name translation
 - latitude and longitude (`latlng`)
 - name of residents (`demonym`)
 - landlocked status (`landlocked`)
 - land borders (`borders`)
 - land area in km² (`area`)

# Example

``` js
var c2c = require('coordinates2country');
var coordinates = {'longitude': 13.377633, 'latitude': 49.747487};
var country = c2c(coordinates.longitude, coordinates.latitude);
console.log(JSON.stringify(country, null, 2));
```

output:

```json
{
  "name": {
    "common": "Czechia",
    "official": "Czech Republic",
    "native": {
      "ces": {
        "official": "česká republika",
        "common": "Česko"
      },
      "slk": {
        "official": "Česká republika",
        "common": "Česko"
      }
    }
  },
  "tld": [
    ".cz"
  ],
  "cca2": "CZ",
  "ccn3": "203",
  "cca3": "CZE",
  "cioc": "CZE",
  "currency": [
    "CZK"
  ],
  "callingCode": [
    "420"
  ],
  "capital": "Prague",
  "altSpellings": [
    "CZ",
    "Česká republika",
    "Česko"
  ],
  "region": "Europe",
  "subregion": "Eastern Europe",
  "languages": {
    "ces": "Czech",
    "slk": "Slovak"
  },
  "translations": {
    "cym": {
      "official": "Y Weriniaeth Tsiec",
      "common": "Y Weriniaeth Tsiec"
    },
    "deu": {
      "official": "Tschechische Republik",
      "common": "Tschechien"
    },
    "fra": {
      "official": "République tchèque",
      "common": "Tchéquie"
    },
    "hrv": {
      "official": "Češka",
      "common": "Češka"
    },
    "ita": {
      "official": "Repubblica Ceca",
      "common": "Cechia"
    },
    "jpn": {
      "official": "チェコ共和国",
      "common": "チェコ"
    },
    "nld": {
      "official": "Tsjechische Republiek",
      "common": "Tsjechië"
    },
    "por": {
      "official": "República Checa",
      "common": "Chéquia"
    },
    "rus": {
      "official": "Чешская Республика",
      "common": "Чехия"
    },
    "slk": {
      "official": "Česká republika",
      "common": "Česko"
    },
    "spa": {
      "official": "República Checa",
      "common": "Chequia"
    },
    "fin": {
      "official": "Tšekin tasavalta",
      "common": "Tšekki"
    },
    "est": {
      "official": "Tšehhi Vabariik",
      "common": "Tšehhi"
    },
    "zho": {
      "official": "捷克共和国",
      "common": "捷克"
    }
  },
  "latlng": [
    49.75,
    15.5
  ],
  "demonym": "Czech",
  "landlocked": true,
  "borders": [
    "AUT",
    "DEU",
    "POL",
    "SVK"
  ],
  "area": 78865
}
```

## Credits
Thanks to:
 - @mledoze for https://github.com/mledoze/countries
 - @johan for https://github.com/johan/world.geo.json
 - @substack for https://github.com/substack/point-in-polygon

## License
See [LICENSE](https://github.com/landert/coordinates2country/blob/master/LICENSE).
