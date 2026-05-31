import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents, ZoomControl } from 'react-leaflet'
import './App.css'
import { useState, type ChangeEvent } from 'react'
import changeIcon from "./assets/change-svgrepo-com.svg"
import PositionSelector from './PositionSelector'
import type { Journey } from './types'
import { JourneyEntry } from './JourneyEntry'
import { JourneyVisualizer } from './JourneyVisualizer'

function App() {

  type Stop = {gtfsStopId: number, gtfsStopName: string, stopSlug: string, position: [number, number]}

  const [searchedStops, setSearchedStops] = useState<Stop[]>()
  const [stopType, setStopType] = useState<"target" | "start" >("start")

  const [startStop, setStartStop] = useState<string| null>(null)
  const [targetStop, setTargetStop] = useState<string| null>(null)

  const [startPosition, setStartPosition] = useState<[number, number] | null>(null)
  const [targetPosition, setTargetPosition] = useState<[number, number] | null>(null)

  const [startInput, setStartInput] = useState<string>("")
  const [targetInput, setTargetInput] = useState<string>("")

  const [journeys, setJourneys] = useState<Journey[] | null>(null)
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)


  const handleTypeStop = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    if(stopType == "start"){
      setStartInput(input)
    }
    else if(stopType == "target"){
      setTargetInput(input)
    }
    if(input.length == 1){
      return
    }
    if(input == ""){
      setSearchedStops([])
      if(stopType == "start"){
        setStartStop(null)
        setStartPosition(null)
      }
      else if(stopType == "target"){
        setTargetStop(null)
        setTargetPosition(null)
      }
      return
    }
    const res = await fetch(`http://localhost:5000/api/stops/byNameContaining/${input}`)
    const data = await res.json()
    const uniqueSlugs = new Map((data.items as Stop[]).map(e => [e.stopSlug, e]))
    setSearchedStops(Array.from(uniqueSlugs.values()))
  }

  const handleSearchJourney = async (data: FormData) => {
    const res = await fetch("http://localhost:5000/api/journey/findMultiple", 
      {
        method: "post",
        body: JSON.stringify({
          startStopSlug: startStop,
          targetStopSlug: targetStop,
          startPosition: startStop == null? startPosition: null,
          targetPosition: targetStop == null? targetPosition: null,
          departureTime: data.get("departureTime")?.toString(),
          MinTransferTime: 240
        }),
        headers: {"Content-Type": "application/json"}
      }
    )
    const json = await res.json()
    setJourneys((json as Journey[]).sort((e, j) => e.legCount - j.legCount))
  }

  const handleSelectStop = (type: "target" | "start", stop: Stop) => {
    if(type == "start") {
        setStartStop(stop.stopSlug)
        setStartInput(stop.gtfsStopName)
        setStartPosition(stop.position)
    }
    else if(type == "target") {
        setTargetStop(stop.stopSlug)
        setTargetInput(stop.gtfsStopName)
        setTargetPosition(stop.position)
    }
    setSearchedStops([])
  }

  const handleChangeStops = () => {
    const tempStop = startStop
    const tempStopName = startInput
    const tempPosition = startPosition
    setStartStop(targetStop)
    setStartInput(targetInput)
    setStartPosition(targetPosition)
    setTargetStop(tempStop)
    setTargetInput(tempStopName)
    setTargetPosition(tempPosition)
  } 

  const getLocalISOString = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const renderForm = () => {
    return(
        <>
        <form action={handleSearchJourney} className='searchForm'>
            <input value={startInput} type="text" onClick={() => setStopType("start")} onChange={handleTypeStop} name='startStop' placeholder='From where' />
            <img src={changeIcon} width={20} height={20} className='changeButton' alt="change" onClick={handleChangeStops} />
            <input value={targetInput} type="text" onClick={() => setStopType("target")} onChange={handleTypeStop} name='targetStop' placeholder='To where' />
            <input defaultValue={getLocalISOString()} type="datetime-local" name='departureTime' />
            <button>Search</button>
          </form>
          {searchedStops?.map(e => <div key={e.stopSlug} className='stopEntry' onClick={() => handleSelectStop(stopType, e)}>
            <p>{e.gtfsStopName}</p>
          </div>
        )}
      </>
    )
  }
  const renderJournies = () => {
    return (
        <>
          <button onClick={() => {setJourneys(null); setSelectedJourney(null)}}>Return</button>
          <h2>{startInput}</h2>
          <h2>{targetInput}</h2>
          {journeys!.map((e, i) => <JourneyEntry key={i} journey={e} setSelectedJourney={setSelectedJourney}/>)}
        </>
    )
  }


  return (
    <div className='main'>
      <div className='searchBox'>
        {journeys ? renderJournies(): renderForm()}
      </div>
      <MapContainer center={[50.06458759117688, 19.945528030254714]} zoom={15} style={{width: "100%", height: "100%"}} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />

        <PositionSelector clickEnabled={journeys === null} setStartInput={setStartInput} setTargetInput={setTargetInput} setStartPosition={setStartPosition} setTargetPosition={setTargetPosition} targetPosition={targetPosition} startPosition={startPosition} />

        <JourneyVisualizer journey={selectedJourney} />

      </MapContainer>
    </div>
  )
}

export default App
