// Client ID and API key from the Developer Console
var CLIENT_ID = '669688967165-jdem1dsa7fg1to3a84hq7l0chj8l7iog.apps.googleusercontent.com'

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4']

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'

var gapi, authorizeButton, signoutButton

// TODO: moduleify properly
module.exports = {init}

function init () {
  window.handleClientLoad = handleClientLoad
  authorizeButton = document.getElementById('authorize-button')
  signoutButton = document.getElementById('signout-button')
}

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad () {
  gapi = window.gapi
  gapi.load('client:auth2', initClient)
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient () {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  }).then(function () {
    console.log('INIT CLIENT DONE')
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus)

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
    authorizeButton.onclick = handleAuthClick
    signoutButton.onclick = handleSignoutClick
  })
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus (isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none'
    signoutButton.style.display = 'block'
    loadData()
  } else {
    authorizeButton.style.display = 'block'
    signoutButton.style.display = 'none'
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick (event) {
  gapi.auth2.getAuthInstance().signIn()
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick (event) {
  gapi.auth2.getAuthInstance().signOut()
}

/**
 * TODO: make this a module, stop hardcoding
 */
function loadData () {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1pPN2Jt9TvCurtDYjXrtNucGI1G8bDMOgCzwNLKhPjP4',
    range: 'All Contacts!A2:E'
  }).then(function (response) {
    var range = response.result
    if (range.values.length > 0) {
      const supporters = range.values.map(function (row) {
        const name = row[0]
        const email = row[1]
        const address = row[2] === ',' ? '' : row[2]
        const phone = row[3]
        const originList = row[4]
        return {name, email, address, phone, originList}
      }).filter(function (person) {
        if (!person.name && !person.email) {
          console.log('Skipping person, no name, no email')
          return false
        }
        return true
      })
      window.onLoadSupporters(supporters)
    } else {
      console.log('No data found.')
    }
  }, function (response) {
    console.error(response.result.error.message)
  })
}
