import React, { useState } from 'react'
import type { Journey } from './types'
import { Marker, Polyline, Popup, useMapEvents } from 'react-leaflet'
import { divIcon, icon, type PathOptions } from 'leaflet'
import dotWhite from "./assets/Dot-white.svg"

export const JourneyVisualizer = ({ journey }: { journey: Journey | null }) => {
    const colors = ["green", "cyan", "violet", "orange"]

    const [zoom, setZoom] = useState<number>(15)

    const map = useMapEvents({
        zoom: (e) => {
            setZoom(map.getZoom())
        },
    })
    const stopIcon = icon({
        iconUrl: dotWhite,
        iconSize: [15, 15]
    })
    const walkLine: PathOptions = { color: "grey", dashArray: [10, 10], lineCap: "round", lineJoin: "round" }
    return (
        <>
            {journey?.legs.map(e =>
                <>
                    <Polyline key={e.legIndex} positions={e.shape.map(j => j.position)}
                        pathOptions={e.legType == "Vehicle" ? { color: colors[e.legIndex], weight: 5, dashArray: "" }
                            : walkLine}>
                        {e.legType == "Vehicle" &&
                            <Marker key={e.legIndex} position={e.shape[Math.floor(e.shape.length / 2)].position}
                                icon={divIcon({ className: `routeBadge ${colors[e.legIndex]}`, html: `<h4>${e.route?.gtfsRouteName}</h4>` })} />}
                    </Polyline>
                    {e.stops &&
                        <>
                            <Polyline positions={[e.startPosition, e.stops[0].position]} pathOptions={walkLine} />
                            <Polyline positions={[e.stops[e.stops?.length - 1].position, e.targetPosition]} pathOptions={walkLine} />
                        </>
                    }
                    {zoom > 15 ? e.stops?.map(j =>
                        <Marker key={j.stopSlug} icon={stopIcon} position={j.position}>
                            <Popup className='stopPopup' closeButton={false}>
                                {j.gtfsStopName}
                            </Popup>
                        </Marker>
                    ) : <></>
                    }
                </>
            )}
        </>
    )
}
