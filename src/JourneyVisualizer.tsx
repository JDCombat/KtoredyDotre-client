import React from 'react'
import type { Journey } from './types'
import { Marker, Polyline } from 'react-leaflet'
import { divIcon } from 'leaflet'

export const JourneyVisualizer = ({journey}: {journey: Journey | null}) => {
    const colors = ["green", "cyan", "violet", "orange"]
  return (
    <>
        {journey?.legs.map((e, i) => 
            <Polyline positions={[e.startPosition ,...e.shape.map(j=>j.position), e.targetPosition]} pathOptions={e.legType == "Vehicle" ? { color: colors[i], weight: 5}: {color: "grey", dashArray: [1, 10], lineCap: "round", lineJoin: "round"}}>
                {e.legType == "Vehicle" && <Marker position={e.shape[Math.floor(e.shape.length / 2)].position} icon={divIcon({className: `routeBadge ${colors[i]}`, html: `<h4>${e.route?.gtfsRouteName}</h4>`})}/>}
            </Polyline>
        )}
    </>
  )
}
