#/bin/sh

COUNTRIES=countryInfo.txt
ADMIN_CODES=admin1CodesASCII.txt
CITIES=cities500.txt
CITIES_ZIP=cities500.zip

pushd /tmp
curl -O http://download.geonames.org/export/dump/$COUNTRIES
curl -O http://download.geonames.org/export/dump/$ADMIN_CODES
curl -O http://download.geonames.org/export/dump/$CITIES_ZIP
unzip $CITIES_ZIP

curl -d "{\"citiesFile\":\"/tmp/$CITIES\",\"countriesFile\":\"/tmp/$COUNTRIES\",\"adminCodesFile\":\"/tmp/$ADMIN_CODES\"}" \
    http://localhost:8890/world/populate -H 'Content-Type: application/json'
popd