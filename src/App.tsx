import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import './App.css'
import PositionSelector from './PositionSelector'
import { JourneyVisualizer } from './JourneyVisualizer'
import { useJourneyPlanner } from './useJourneyPlanner'
import { JourneyPlanner } from './JourneyPlanner'

function App() {
  const journeyState = useJourneyPlanner()

  return (
    <div className='main'>
      <div className='searchBox'>
          <JourneyPlanner state={journeyState} />
      </div>
      <MapContainer center={[50.06458759117688, 19.945528030254714]} zoom={15} style={{ width: "100%", height: "100%" }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />

        <PositionSelector
          clickEnabled={journeyState.journeys === null}
          setStartInput={journeyState.setStartInput}
          setTargetInput={journeyState.setTargetInput}
          setStartPosition={journeyState.setStartPosition}
          setTargetPosition={journeyState.setTargetPosition}
          targetPosition={journeyState.targetPosition}
          startPosition={journeyState.startPosition}
          setStartStop={journeyState.setStartStop}
          setTargetStop={journeyState.setTargetStop}
          handleSearchJourney={journeyState.handleSearchJourney}
          searched={journeyState.searched} />

        <JourneyVisualizer journey={journeyState.previewJourney} />
        <JourneyVisualizer journey={journeyState.selectedJourney} />
        {/* <JourneyVisualizer /> */}
      </MapContainer>
    </div>
  )
}

export default App
