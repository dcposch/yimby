import 'babel-polyfill'

import React from 'react'
import {render} from 'react-dom'
import Zoning from './zoning'
import Contacts from './contacts'
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
    case '/contacts/':
      return loadContacts()
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

function loadContacts () {
  window.mapContacts = render(
    <Contacts />,
    document.querySelector('#container')
  )
}

function fetch (url, cb) {
  const xhr = new window.XMLHttpRequest()
  xhr.onload = () => cb(xhr.response)
  xhr.responseType = 'json'
  xhr.open('GET', url)
  xhr.send()
}
