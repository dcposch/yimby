import 'babel-polyfill'

import React from 'react'
import {render} from 'react-dom'
import Zoning from './zoning'
import Supporters from './supporters'
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
  const mapSupporters = window.mapSupporters = render(
    <Supporters />,
    document.querySelector('#container')
  )

  // TODO: use a class, use a module
  Sheets.init()
  window.onLoadSupporters = onLoadSupporters
  window.mapSupporters = mapSupporters

  function onLoadSupporters (supporters) {
    supporters.forEach(function (supporter, index) {
      supporter.index = index
      supporter.geo = {
        center: [-122.57 + (index % 25) * 0.0017, 37.7 + Math.floor(index / 25) * 0.0014]
      }
    })
    window.supporters = supporters
    window.geoIndex = 0
    window.numSucceeded = 0
    window.numFailed = 0
    // Geocode
    mapSupporters.setState({data: supporters})
    geocodeNext()
  }
}

function geocodeNext () {
  if (window.geoIndex >= window.supporters.length) return // done

  const supporter = window.supporters[window.geoIndex++]
  const address = supporter.address

  fetchAddress(address, function (data) {
    if (data && data.features && data.features[0]) {
      supporter.geo = data.features[0]
      supporter.status = 'succeeded'
      window.numSucceeded++
    } else {
      supporter.status = 'failed'
      window.numFailed++
    }

    if (window.geoIndex % 10 === 0 || window.geoIndex >= window.supporters.length) {
      const {numSucceeded, numFailed} = window
      window.mapSupporters.setState({numSucceeded, numFailed})
    }
    geocodeNext()
  })
}

function fetchAddress (address, cb) {
  if (!address) return cb()
  address = address.trim()
    .replace(/ US$/i, '')
    .replace(/ USA$/i, '')
    .replace(/ United States$/i, '')
  if (address === '') return cb()

  const json = window.localStorage[address]
  if (json) return cb(JSON.parse(json))

  console.log('Geocoding ' + address)
  const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
    window.encodeURIComponent(address) + '.json?access_token=' + config.MAPBOX_TOKEN
  fetch(url, function (data) {
    window.localStorage[address] = JSON.stringify(data)
    cb(data)
  })
}

function fetch (url, cb) {
  const xhr = new window.XMLHttpRequest()
  xhr.onload = () => cb(xhr.response)
  xhr.responseType = 'json'
  xhr.open('GET', url)
  xhr.send()
}
