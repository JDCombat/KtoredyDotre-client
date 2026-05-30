import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet'
import './App.css'
import { useRef, useState, type ChangeEvent } from 'react'

function App() {

  type Stop = {gtfsStopId: number, gtfsStopName: string, stopSlug: string, position: number[]}

  const [searchedStops, setSearchedStops] = useState<Stop[]>()
  const [stopType, setStopType] = useState<"target" | "start" >("start")
  const [startStop, setStartStop] = useState<string>("")
  const [targetStop, setTargetStop] = useState<string>("")

  const [startStopInput, setStartStopInput] = useState<string>("")
  const [targetStopInput, setTargetStopInput] = useState<string>("")

  const handleTypeStop = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    if(stopType == "start"){
      setStartStopInput(input)
    }
    else if(stopType == "target"){
      setTargetStopInput(input)
    }
    if(input == ""){
      setSearchedStops([])
      return
    }
    const res = await fetch(`http://localhost:5000/api/stops/byNameContaining/${input}`)
    const data = await res.json()
    const uniqueSlugs = new Map((data.items as Stop[]).map(e => [e.stopSlug, e]))
    setSearchedStops(Array.from(uniqueSlugs.values()))
  }

  const handleSearchJourney = async (data: FormData) => {
    const res = await fetch("http://localhost:5000/api/journey/findMultiple", {method: "post", body: JSON.stringify({startStopSlug: startStop, targetStopSlug: targetStop, departureTime: "2026-05-30T14:00:00"}), headers: {"Content-Type": "application/json"}})
    const json = await res.json()
    console.log(json)
  }

  const handleSelectStop = (type: "target" | "start", stop: Stop) => {
    if(type == "start")
      {
        setStartStop(stop.stopSlug)
        setStartStopInput(stop.gtfsStopName)
      }
    else if(type == "target"){
        setTargetStop(stop.stopSlug)
        setTargetStopInput(stop.gtfsStopName)
    }
    setSearchedStops([])
  }

  return (
    <div className='main'>
      <div className='searchBox'>
        <form action={handleSearchJourney} className='searchForm'>
          <input value={startStopInput} type="text" onClick={() => setStopType("start")} onChange={handleTypeStop} name='startStop' placeholder='From where' />
          <input value={targetStopInput} type="text" onClick={() => setStopType("target")} onChange={handleTypeStop} name='targetStop' placeholder='To where' />
          <button>Search</button>
        </form>
        {searchedStops?.map(e => <p onClick={() => handleSelectStop(stopType, e)}>{e.gtfsStopName}</p>)}
      </div>
      <MapContainer center={[50.06458759117688, 19.945528030254714]} zoom={15} style={{width: "100%", height: "100%"}} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />

      </MapContainer>
    </div>
  )
}

export default App
