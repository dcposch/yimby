import React from 'react'

import zoneColors from './zone-colors'

module.exports = function ZoningDescription (props) {
  const {selectedZone, onSelectZone} = props

  function renderLegend (ids) {
    const items = []
    ids.forEach((id) => {
      items.push(
        <span
          className={id === selectedZone ? 'selected' : ''}
          style={{borderTopColor: zoneColors.html(id)}}
          onClick={() => onSelectZone(id)}
          key={id}
          title={id}
        >
          {id}
        </span>
      )
      items.push(' ')
    })
    return (<p className='legend'>{items}</p>)
  }

  return (
    <div className='zones'>

      <h1>sf zoning map</h1>
      <p>
        in san francisco, what you can build and where depends on a complex system of zoning and
        height restrictions.
      </p>
      <p>
        <strong>here's an overview.</strong> you can drag the map to move around. hold shift to
        rotate. pinch or scroll to zoom. click on the map for details.
      </p>
      <p>
        <strong>
          want a more inclusive, urban city to call home?
          join <a href='https://sfyimby.org'>sf yimby</a>
        </strong>
      </p>

      <h2>RH-1: the burbs</h2>
      {renderLegend(['RH-1(D)', 'RH-1', 'RH-1(S)'])}
      <p>
        much of the residential land in our city is suburban-style development where you're only
        allowed to build a single unit per lot. RH-1(D) means those units have to be detached
        houses.
      </p>
      <p>
        <strong>click on the legend to toggle filters.</strong>{' '}
        filters let you see every place in the city that's zoned a certain way.
      </p>

      <h2>RH-2 and -3: low density residential</h2>
      {renderLegend(['RH-2', 'RH-3'])}
      <p>
        these zones are better than RH-1, but still pretty sparse, and still car-centric.
      </p>

      <h2>RM: residential mixed</h2>
      {renderLegend(['RM-1', 'RM-2', 'RM-3', 'RM-4', 'RC-3', 'RC-4', 'RCD', 'RTO', 'RTO-M'])}
      <p>
        these zones allow housing, grocery stores, office space, and shops in the same neighborhood.
        that makes them friendlier for people who want to walk or bike.
      </p>
      {renderLegend(['MUO', 'MUG', 'MUR', 'UMU', 'WMUG', 'WMUO', 'SSO'])}
      <p>
        soma and fidi have their own zones, including three kinds of "mixed use" and
        one kind of "urban mixed use". the bureaucracy has no chill.
      </p>

      <h2>RED: dense residential</h2>
      {renderLegend(['RED', 'RED-MX', 'RH DTR', 'SB-DTR', 'TB DTR'])}
      <p>
        soma has "residential enclaves", which are several-story apartment complexes.
        fidi has "downtown residential" zones, which contain skyscrapers.
      </p>

      <h2>NCT and NCD: "neighborhood commercial"</h2>
      {renderLegend(['NC-1', 'NC-2', 'NC-3', 'NC-S', 'NCD', 'NCT', 'NCT-1', 'NCT-2', 'NCT-3'])}
      <p>
        these are street districts that allow housing, shops, and transit. they vary in density.
        some are pretty great.
      </p>
      <h2>C: commercial</h2>
      {renderLegend(['C-2', 'C-3-G', 'C-3-O', 'C-3-O(SD)', 'C-3-R', 'C-3-S'])}
      <p>
        this mostly means office towers, but also includes shopping malls. no housing.
      </p>

      <h2>M and PDR: industrial areas</h2>
      {renderLegend(['M-1', 'M-2', 'PDR-1-B', 'PDR-1-D', 'PDR-1-G', 'PDR-2', 'SALI', 'SLI'])}
      <p>
        M-1 and M-2 are light and heavy industrial zones. PDR stands for "production, distribution,
        repair" and includes things like warehouses and auto body shops. they're fine on the
        outskirts of the city, but hard to justify in neighborhoods like soma where a studio can
        cost $3,000 a month.
      </p>

      <h2>special zones</h2>
      {renderLegend(['CCB', 'CRNC', 'CVR'])}
      {renderLegend(['MB-O', 'MB-OS', 'MB-RA', 'SPD', 'HP-RA'])}
      {renderLegend(['PM-OS', 'PM-S', 'PM-CF', 'PM-MU1', 'PM-MU2', 'PM-R'])}
      <p>
        some places, like Chinatown, Mission Bay, South Park, Hunters Point, and Park Merced, get
        their own special zoning. the rules vary, but for the most part these areas are good.
        unlike the bedroom community garage-and-driveway vibe of RH-1, special zones allow mixed
        use and have a unique local character.
      </p>

      <p>
        <strong>
          want to build more housing?{' '}
          <a href='https://www.yimbyaction.org/join'>donate to YIMBY Action.</a>.
        </strong>
      </p>
      <p>
        <strong>
          want to sue the people who aren't building housing?{' '}
          <a href='http://www.carlaef.org/donate'>donate to carla</a>. it's tax deductible!
        </strong>
      </p>

      <footer>
        made with <a href='//uber.github.io/deck.gl'>deck.gl</a> and{' '}
        <a href='//data.sfgov.org/'>sf open data</a>.
        code on <a href='//github.com/dcposch/yimby'>github</a>.
        twitter: <a href='//twitter.com/dcposch'>@dcposch</a>
      </footer>
    </div>
  )
}
