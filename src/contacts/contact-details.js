import React from 'react'

module.exports = function ContactDetails (props) {
  const {name, address, email, phone, originList, totalDonation} = props.person

  return (
    <div className='details'>
      <h2>{name || '<name unknown>'}</h2>
      { address ? <p><strong>{address}</strong></p> : null }
      { email ? <p><strong>{email}</strong></p> : null }
      { phone ? <p><strong>{phone}</strong></p> : null }
      { originList ? <p>Origin list: <strong>{originList}</strong></p> : null }
      { totalDonation ? <p>Total donation: <strong>${totalDonation.toFixed(2)}</strong></p> : null }
    </div>
  )
}
