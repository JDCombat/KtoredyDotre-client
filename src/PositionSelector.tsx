import { divIcon, LatLng, LatLngBounds, type LeafletMouseEvent } from 'leaflet'
import { useEffect, useState } from 'react'
import { Marker, Popup, useMapEvents } from 'react-leaflet'

type props = {
    startPosition: [number, number] | null
    setStartPosition: (state: [number, number] | null) => void
    targetPosition: [number, number] | null
    setTargetPosition: (state: [number, number] | null) => void
    setStartInput: (state: string) => void
    setTargetInput: (state: string) => void,
    clickEnabled: boolean
}



export default function PositionSelector({startPosition, setStartPosition, targetPosition, setTargetPosition, setTargetInput, setStartInput, clickEnabled}: props) {
    const [selectingPosition, setSelectingPosition] = useState<LatLng | null>(null)
    const map = useMapEvents({
        click(e: LeafletMouseEvent) {
            if(!clickEnabled) return
            if(e.originalEvent.target instanceof HTMLButtonElement){
                return
            }
            setTimeout(() => setSelectingPosition(e.latlng), 1)
        }
    })
    useEffect(() => {
        if(startPosition) {
            if(targetPosition){
                map.flyToBounds(new LatLngBounds([targetPosition, startPosition]))
            }
            else{
                map.flyTo(startPosition, map.getZoom())
            }
        }
    }, [startPosition])
    useEffect(() => {
        if(targetPosition) {
            if(startPosition){
                map.flyToBounds(new LatLngBounds([targetPosition, startPosition]))
            }
            else{
                map.flyTo(targetPosition, map.getZoom())
            }
        }
    }, [targetPosition])
    const handleSetPosition = async (type: "start" | "target") => {
        if(type == "start"){
            setStartPosition([selectingPosition!.lat, selectingPosition!.lng])
        }
        if(type == "target"){
            setTargetPosition([selectingPosition!.lat, selectingPosition!.lng])
        }
        map.flyTo(selectingPosition!, map.getZoom())

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${selectingPosition?.lat}&lon=${selectingPosition?.lng}&format=json`, {headers: {"accept-language": "pl-PL"}})
        .then(res => res.json())
        .then(data => {
            if(type == "start"){
                setStartInput(data.display_name?.toString() ?? "Point on map")
            }
            else{
                setTargetInput(data.display_name?.toString() ?? "Point on map")
            }
        })

        setSelectingPosition(null)
    }

    const startIcon = divIcon({
        className: "divIcon",
        html: "<h4>START</h4>"
    })
    const targetIcon = divIcon({
        className: "divIcon",
        html: "<h4>END</h4>"
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
            <Marker position={new LatLng(startPosition[0], startPosition[1])} icon={startIcon} />
        }
        {targetPosition &&
            <Marker position={new LatLng(targetPosition[0], targetPosition[1])} icon={targetIcon} />
        }
    </>
  )
}
