#!/bin/bash
# Downloads city data
# Maps and more info available at data.sfgov.org

set -e

DIR=`dirname "${BASH_SOURCE[0]}"`/../download

rm -rf $DIR
mkdir -p $DIR

# SODA API JSON:
wget 'https://data.sfgov.org/resource/a2rp-pwkh.json?$limit=1000000' -O $DIR/land-use.json
wget 'https://data.sfgov.org/resource/45et-ht7c.json?$limit=1000000' -O $DIR/city-lots.json
# Broken: wget 'https://data.sfgov.org/resource/8br2-hhp3.json?$limit=1000000' -O $DIR/zoning.json
wget 'https://data.sfgov.org/api/geospatial/xvjh-uu28?method=export&format=GeoJSON' -O $DIR/zoning.json
# Broken: wget 'https://data.sfgov.org/resource/487i-vkgi.json?$limit=1000000' -O $DIR/supervisors.json

wget 'https://data.sfgov.org/api/views/sr5d-tnui/rows.csv' -O $DIR/addresses.csv

# Alternate CSV download:
# - Addresses: https://data.sfgov.org/api/views/sr5d-tnui/rows.csv
# - Land Use: https://data.sfgov.org/api/views/a2rp-pwkh/rows.csv
# - City Lots: https://data.sfgov.org/api/views/45et-ht7c/rows.csv
# - Zoning: https://data.sfgov.org/api/views/8br2-hhp3/rows.csv

# GIS download:
# - SF City Lands: http://apps.sfgov.org/datafiles/view.php?file=sfgis/sflnds_current.zip
