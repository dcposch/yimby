import React from 'react'

export default function Controls (props) {
  const {isLoggedIn, contacts} = props

  return (
    <div className='summary'>
      <h1>yimby contacts</h1>
      <p>
        here's where our contacts live. click on any of the dots for details.
        missing addresses are to the left, by ocean beach.
      </p>

      <h2>salesforce api</h2>
      <p>
        certified yimby party members only. if you have access to the
        yimby salesforce, you can authorize this page to map contacts.
      </p>
      <p>
        {
          isLoggedIn
            ? <span>logged in</span>
            : <a href='https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id=3MVG9szVa2RxsqBYHAPh..zyh4EVbe.lQAkzoWqg8MoVL4ttsXhCu0YlLbISt_OAPP16XvT3v0e0tm.JMATvx
  &redirect_uri=https://dcpos.ch/yimby/contacts/'>log in</a>
        }
      </p>
      <p>
        loaded <strong>{contacts.length}</strong> contacts with valid addresses<br />
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
