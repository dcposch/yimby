import {ChoroplethLayer} from 'deck.gl'

class ZoningLayer extends ChoroplethLayer {
  constructor (props) {
    const {data, hover, select, onHover, onSelect} = props

    super({
      data,
      pickable: true,

      getColor: (f) => {
        const props = f.properties
        return this.getZoneColor(props)
      },

      onHover: (info) => {
        if (info.index > 0 && info.index === select) return // already selected
        if (info.index === hover) return // already hovered
        onHover(info)
      },

      onClick: (info) => {
        if (info.index === select) return // already selected
        onSelect(info)
      },

      updateTriggers: {
        colors: {hover, select}
      }
    })

    this.props.zoneColors = props.zoneColors
    this.props.filteredZoneSimpleID = props.filteredZoneSimpleID
  }

  getZoneColor (zoneProps, isHover, isSelect) {
    const zid = zoneProps.idSimple
    const zidFilter = this.props.filteredZoneSimpleID

    let alpha = 0.6
    if (isHover) alpha = 0.7
    else if (isSelect) alpha = 1.0
    if (zidFilter && zid !== zidFilter) alpha = 0

    var color = this.props.zoneColors[zid]
    if (!color) throw new Error('Missing color for ' + zid)

    const rgba = [].concat(color, [Math.round(alpha * 255)])
    return rgba
  }
}

ZoningLayer.layerName = 'ZoningLayer'

module.exports = ZoningLayer
