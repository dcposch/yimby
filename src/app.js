import '@babel/polyfill'

import React from 'react'
import { render } from 'react-dom'
import Zoning from './zoning'
import Contacts from './contacts'

main()

function main () {
  let path = document.location.pathname
  // Hack to make these pages work when served from dcpos.ch/yimby/
  if (path.startsWith('/yimby')) {
    path = path.substring('/yimby'.length)
  }
  console.log('Loading ' + path)
  const component = route(path)
  if (component) {
    render(component, document.querySelector('#container'))
  }
}

function route (path) {
  switch (path) {
    case '/':
      return null
    case '/zoning/':
      return <Zoning />
    case '/contacts/':
      return <Contacts />
    default:
      console.error('Unknown path')
  }
}
