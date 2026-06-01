import { divIcon, LatLng, LatLngBounds, type LeafletEventHandlerFnMap, type LeafletMouseEvent } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { Marker, Popup, useMapEvents } from 'react-leaflet'
import type { JourneySearchOverrides } from './types'

type props = {
    startPosition: [number, number] | null
    setStartPosition: (state: [number, number] | null) => void
    targetPosition: [number, number] | null
    setTargetPosition: (state: [number, number] | null) => void
    setStartInput: (state: string) => void
    setTargetInput: (state: string) => void,
    clickEnabled: boolean,
    setStartStop: (state: string | null) => void
    setTargetStop: (state: string | null) => void,
    handleSearchJourney: (data: JourneySearchOverrides) => void
    searched: boolean
}

export default function PositionSelector({ startPosition, setStartPosition, targetPosition, setTargetPosition, setTargetInput, setStartInput, clickEnabled, setTargetStop, setStartStop, handleSearchJourney, searched }: props) {
    const [selectingPosition, setSelectingPosition] = useState<LatLng | null>(null)

    const targetMarkerRef = useRef<any>(null)
    const startMarkerRef = useRef<any>(null)

    const map = useMapEvents({
        click(e: LeafletMouseEvent) {
            if (!clickEnabled) return
            if (e.originalEvent.target instanceof HTMLButtonElement) {
                return
            }
            setTimeout(() => setSelectingPosition(e.latlng), 1)
        },
    })
    const targetEventHandlers: LeafletEventHandlerFnMap = {
        dragend: (e) => {
            console.log(e)
            if (targetMarkerRef.current) {
                const latLang = targetMarkerRef.current.getLatLng()
                setTargetPosition([latLang.lat, latLang.lng])
                setTargetStop(null)
                if(searched){
                    handleSearchJourney({newTargetPos: [latLang.lat, latLang.lng], newTargetStop: null})
                }
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latLang?.lat}&lon=${latLang?.lng}&format=json`, { headers: { "accept-language": "pl-PL" } })
                    .then(res => res.json())
                    .then(data => {
                        setTargetInput(data.display_name?.toString().split(",").slice(0, 2).reverse().join(" ") ?? "Point on map")
                    })
            }

        }
    }
    const startEventHandlers: LeafletEventHandlerFnMap = {
        dragend: () => {
            if (startMarkerRef.current) {
                const latLang = startMarkerRef.current.getLatLng()
                setStartPosition([latLang.lat, latLang.lng])
                setStartStop(null)
                if(searched){
                    handleSearchJourney({newStartPos: [latLang.lat, latLang.lng], newStartStop: null})
                }
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latLang?.lat}&lon=${latLang?.lng}&format=json`, { headers: { "accept-language": "pl-PL" } })
                    .then(res => res.json())
                    .then(data => {
                        setStartInput(data.display_name?.toString().split(",").slice(0, 2).reverse().join(" ") ?? "Point on map")
                    })
            }
        }
    }
    useEffect(() => {
        if (startPosition) {
            if (targetPosition) {
                map.flyToBounds(new LatLngBounds([targetPosition, startPosition]), { paddingTopLeft: [440, 0] })
            }
            else {
                map.flyTo(startPosition, map.getZoom())
            }
        }
    }, [startPosition])
    useEffect(() => {
        if (targetPosition) {
            if (startPosition) {
                map.flyToBounds(new LatLngBounds([targetPosition, startPosition]), { paddingTopLeft: [440, 0] })
            }
            else {
                map.flyTo(targetPosition, map.getZoom())
            }
        }
    }, [targetPosition])
    const handleSetPosition = async (type: "start" | "target") => {
        if (type == "start") {
            setStartPosition([selectingPosition!.lat, selectingPosition!.lng])
            setStartStop(null)
        }
        if (type == "target") {
            setTargetPosition([selectingPosition!.lat, selectingPosition!.lng])
            setTargetStop(null)
        }
        map.flyTo(selectingPosition!, map.getZoom(),)

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${selectingPosition?.lat}&lon=${selectingPosition?.lng}&format=json`, { headers: { "accept-language": "pl-PL" } })
            .then(res => res.json())
            .then(data => {
                if (type == "start") {
                    setStartInput(data.display_name?.toString().split(",").slice(0, 2).reverse().join(" ") ?? "Point on map")
                }
                else {
                    setTargetInput(data.display_name?.toString().split(",").slice(0, 2).reverse().join(" ") ?? "Point on map")
                }
            })

        setSelectingPosition(null)
    }

    const startIcon = divIcon({
        className: "divIcon",
        html: "<div class='contentWrapper'><h4>START</h4></div><div class='tip'></div>"
    })
    const targetIcon = divIcon({
        className: "divIcon",
        html: "<div class='contentWrapper'><h4>END</h4></div><div class='tip'></div>"
    })
    return (
        <>
            {selectingPosition &&
                <Popup position={selectingPosition} keepInView={true}>
                    <button onClick={() => handleSetPosition("start")}>Set as start position</button>
                    <button onClick={() => handleSetPosition("target")}>Set as target position</button>
                </Popup>
            }
            {startPosition &&
                <Marker ref={startMarkerRef} eventHandlers={startEventHandlers} draggable={true} position={new LatLng(startPosition[0], startPosition[1])} icon={startIcon} />
            }
            {targetPosition &&
                <Marker ref={targetMarkerRef} eventHandlers={targetEventHandlers} draggable={true} position={new LatLng(targetPosition[0], targetPosition[1])} icon={targetIcon} />
            }
        </>
    )
}
