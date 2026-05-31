import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import './App.css'
import { useEffect, useState, type ChangeEvent } from 'react'
import changeIcon from "./assets/change-svgrepo-com.svg"
import PositionSelector from './PositionSelector'
import type { Journey } from './types'
import { JourneyEntry } from './JourneyEntry'
import { JourneyVisualizer } from './JourneyVisualizer'

function App() {

  type Stop = { gtfsStopId: number, gtfsStopName: string, stopSlug: string, position: [number, number] }

  const [searchedStops, setSearchedStops] = useState<Stop[]>()
  const [stopType, setStopType] = useState<"target" | "start">("start")

  const [startStop, setStartStop] = useState<string | null>(null)
  const [targetStop, setTargetStop] = useState<string | null>(null)

  const [startPosition, setStartPosition] = useState<[number, number] | null>(null)
  const [targetPosition, setTargetPosition] = useState<[number, number] | null>(null)

  const [startInput, setStartInput] = useState<string>("")
  const [targetInput, setTargetInput] = useState<string>("")

  const [journeys, setJourneys] = useState<Journey[] | null>(null)
  const [previewJourney, setPreviewJourney] = useState<Journey | null>(null)
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)

  const getLocalISOString = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const [date, setDate] = useState<string>(getLocalISOString())

  useEffect(() => {
    if (previewJourney) {
      setStartPosition(previewJourney.startPosition)
      setTargetPosition(previewJourney.targetPosition)
    }
  }, [previewJourney])


  const handleTypeStop = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    if (stopType == "start") {
      setStartInput(input)
    }
    else if (stopType == "target") {
      setTargetInput(input)
    }
    if (input.length == 1) {
      return
    }
    if (input == "") {
      setSearchedStops([])
      if (stopType == "start") {
        setStartStop(null)
        setStartPosition(null)
      }
      else if (stopType == "target") {
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
          startPosition: startStop == null ? startPosition : null,
          targetPosition: targetStop == null ? targetPosition : null,
          departureTime: date,
          MinTransferTime: 240
        }),
        headers: { "Content-Type": "application/json" }
      }
    )
    const json = await res.json()
    if (json?.status == 500) {
      alert(json.title)
      return
    }
    setJourneys(json)

  }

  const handleSelectStop = (type: "target" | "start", stop: Stop) => {
    if (type == "start") {
      setStartStop(stop.stopSlug)
      setStartInput(stop.gtfsStopName)
      setStartPosition(stop.position)
    }
    else if (type == "target") {
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



  const renderForm = () => {
    return (
      <>
        <form action={handleSearchJourney} className='searchForm'>
          <input value={startInput} type="text" onClick={() => setStopType("start")} onChange={handleTypeStop} name='startStop' placeholder='From where' />
          <img src={changeIcon} width={20} height={20} className='changeButton' alt="change" onClick={handleChangeStops} />
          <input value={targetInput} type="text" onClick={() => setStopType("target")} onChange={handleTypeStop} name='targetStop' placeholder='To where' />
          <input value={date} onChange={(e) => setDate(e.target.value)} type="datetime-local" name='departureTime' />
          <button>Search</button>
        </form>
        <div className="scrollWrap">
          {searchedStops?.map(e =>
            <div key={e.stopSlug} className='stopEntry' onClick={() => handleSelectStop(stopType, e)}>
              <p>{e.gtfsStopName}</p>
            </div>
          )}
        </div>
      </>
    )
  }
  const renderJournies = () => {
    return (
      <>
        <button onClick={() => { setJourneys(null); setPreviewJourney(null) }}>Return</button>
        <h2>{startInput}</h2>
        <h2>{targetInput}</h2>
        <div className='scrollWrap'>
          {journeys!.map((e, i) => <JourneyEntry key={i} journey={e} setPreviewJourney={setPreviewJourney} setSelectedJourney={setSelectedJourney} />)}
        </div>
      </>
    )
  }
  const renderSelectedJourney = () => {
    return (
      <>
        <button onClick={() => setSelectedJourney(null)}>Return</button>
        <JourneyEntry journey={selectedJourney!} setPreviewJourney={() => { }} setSelectedJourney={() => { }} />
        <div className='scrollWrap'>
          {selectedJourney!.legs.map((e, i, arr) =>
            <>
              {(e.stops == null && e.route == null) ?
                <>
                  <h3>Pieszo</h3>
                  <p>{Math.ceil(new Date(new Date(e.arrivalTime).getTime() - new Date(e.departureTime).getTime()).getTime() / (1000 * 60))} minut</p>
                </>
                : <>
                  <h3>{e.route?.gtfsRouteName}</h3>
                  {e.stops?.map(e => <p>{e.departureTime.slice(11, 16)} {e.gtfsStopName}</p>)}
                </>
              }
            </>
          )}
        </div>

      </>
    )
  }


  return (
    <div className='main'>
      <div className='searchBox'>
        {journeys ?
          <>
            {selectedJourney ? renderSelectedJourney() : renderJournies()}
          </>
          : renderForm()
        }
      </div>
      <MapContainer center={[50.06458759117688, 19.945528030254714]} zoom={15} style={{ width: "100%", height: "100%" }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />

        <PositionSelector
          clickEnabled={journeys === null}
          setStartInput={setStartInput}
          setTargetInput={setTargetInput}
          setStartPosition={setStartPosition}
          setTargetPosition={setTargetPosition}
          targetPosition={targetPosition}
          startPosition={startPosition}
          setStartStop={setStartStop}
          setTargetStop={setTargetStop}
          handleSearchJourney={handleSearchJourney} />

        <JourneyVisualizer journey={previewJourney} />
        <JourneyVisualizer journey={selectedJourney} />

      </MapContainer>
    </div>
  )
}

export default App
