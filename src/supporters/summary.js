import React from 'react'

module.exports = function Summary (props) {
  const {numSupporters, numSucceeded, numFailed} = props.counts

  return (
    <div className='summary'>
      <h1>yimby supporters</h1>
      <p>
        here's where our supporters live.
        missing and invalid addresses are off to the left, in the ocean.
      </p>

      <h2>google sheets api test</h2>
      <p>
        certified yimby party members only. if you have access to the <a
          href='https://docs.google.com/spreadsheets/d/1pPN2Jt9TvCurtDYjXrtNucGI1G8bDMOgCzwNLKhPjP4/edit#gid=0'>
        contacts google spreadsheet</a>, you can authorize this page to map it.
      </p>
      <p>
        <button id='authorize-button' style={{display: 'none'}}>Authorize</button>
        <button id='signout-button' style={{display: 'none'}}>Sign Out</button>
      </p>
      <p>
        loaded <strong>{numSupporters}</strong> supporters<br />
        got lat/lon for <strong>{numSucceeded}</strong> valid addresses<br />
        found <strong>{numFailed}</strong> invalid or missing addresses<br />
        {(numSucceeded + numFailed === numSupporters) ? 'done.' : 'looking up addresses with mapbox...'}
      </p>

      <h2>district</h2>
      <p className='legend'>
        <span>D1</span>{' '}
        <span>D2</span>{' '}
        <span>D3</span>{' '}
        <span>D4</span>{' '}
        <span>D5</span>{' '}
        <span>D6</span>{' '}
        <span>D7</span>{' '}
        <span>D8</span>{' '}
        <span>D9</span>{' '}
        <span>D10</span>{' '}
        <span>D11</span>
      </p>
      <p>
        <strong>coming soon:</strong> click on a district above to filter.
      </p>

      <footer>
        yimby digital liberation army.
        code on <a href='//github.com/dcposch/yimby'>github</a>.
        twitter: <a href='//twitter.com/dcposch'>@dcposch</a>
      </footer>
    </div>
  )
}
