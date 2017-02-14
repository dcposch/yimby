import 'babel-polyfill'

import React from 'react'
import {render} from 'react-dom'
import Zoning from './zoning'
import SupportersMap from './supporters-map'
import Sheets from './sheets'
import config from './config'

main()

function main () {
  let path = document.location.pathname
  // Hack to make these pages work when served from dcpos.ch/yimby/
  if (path.startsWith('/yimby')) {
    path = path.substring('/yimby'.length)
  }
  console.log('Loading ' + path)
  switch (path) {
    case '/':
      return
    case '/zoning/':
      return loadZoning()
    case '/supporters/':
      return loadSupporters()
    default:
      console.error('Unknown path')
  }
}

function loadZoning () {
  const mapZoning = window.mapZoning = render(
    <Zoning />,
    document.querySelector('#container')
  )

  fetch('../build/zoning-geojson.json', function (data) {
    // Don't show public land like parks and highways.
    // Filter it out here, not during data preprocessing, so that we can
    // simplify / re-use / browser-cache the data sets we're loading.
    // I might want to show public lots in a different visualization.
    data.features = data.features.filter(function (feature) {
      return feature.properties.idSimple !== 'P'
    })
    mapZoning.setState({data})
  })
}

function loadSupporters () {
  const mapSupporters = render(
    <SupportersMap />,
    document.querySelector('#container')
  )

  // TODO: use a class, use a module
  Sheets.init()
  window.onLoadSupporters = onLoadSupporters
  window.mapSupporters = mapSupporters

  function onLoadSupporters (supporters) {
    window.supporters = supporters
    window.geoIndex = 0
    // Geocode
    mapSupporters.setState({data: supporters})
    geocodeNext()
    fetch('///geocoding/v5/{mode}/')
  }
}

function geocodeNext () {
  if (window.geoIndex >= window.supporters.length) return
  const supporter = window.supporters[window.geoIndex++]
  const address = supporter.address
  if (!address) setTimeout(geocodeNext, 0)

  console.log('DBG geocoding ' + address)
  const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
    address + '.json?access_token=' + config.MAPBOX_TOKEN
  fetch(url, function (data) {
    console.log('DBG got geocode', data)
    if (data.features) {
      supporter.geo = data.features[0]
    }
    // TODO: remove this nasty hack
    if (window.geoIndex % 50 === 0) {
      window.mapSupporters.setState({data: window.supporters.slice()})
    }
    geocodeNext()
  })
}

function fetch (url, cb) {
  const xhr = new window.XMLHttpRequest()
  xhr.onload = () => cb(xhr.response)
  xhr.responseType = 'json'
  xhr.open('GET', url)
  xhr.send()
}
