import changeIcon from "./assets/change-svgrepo-com.svg"
import { JourneyEntry } from './JourneyEntry'
import type { useJourneyPlanner } from './useJourneyPlanner'

interface JourneyPlannerProps {
  state: ReturnType<typeof useJourneyPlanner>;
}

export function JourneyPlanner({ state }: JourneyPlannerProps) {
  const {
    searchedStops,
    stopType,
    setStopType,
    startInput,
    targetInput,
    searched,
    setSearched,
    searching,
    journeys,
    setJourneys,
    setPreviewJourney,
    selectedJourney,
    setSelectedJourney,
    date,
    setDate,
    map,
    handleTypeStop,
    handleSearchJourney,
    handleSelectStop,
    handleChangeStops,
  } = state;

  const renderForm = () => {
    return (
      <>
        <form onSubmit={(e) => { e.preventDefault(); handleSearchJourney(); }} className='searchForm'>
          <input value={startInput} type="text" onClick={() => setStopType("start")} onChange={handleTypeStop} name='startStop' placeholder='From where' />
          <img src={changeIcon} width={20} height={20} className='changeButton' alt="change" onClick={handleChangeStops} />
          <input value={targetInput} type="text" onClick={() => setStopType("target")} onChange={handleTypeStop} name='targetStop' placeholder='To where' />
          <input value={date} onChange={(e) => setDate(e.target.value)} type="datetime-local" name='departureTime' />
          <button>Search</button>
        </form>
        <div className="scrollWrap">
          {searchedStops?.map(e =>
            <div key={e.stopSlug} className='stopEntry' onClick={() => handleSelectStop(stopType, e)}>
              <p style={{ fontWeight: 600 }}>{e.gtfsStopName}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Routes: {map.get(e.stopSlug)}</p>
            </div>
          )}
        </div>
      </>
    )
  }

  const renderJournies = () => {
    return (
      <>
        <div className="results-header">
          <h2>Results</h2>
          <div className="subtitle">{startInput} ➔ {targetInput}</div>
          <button style={{ marginTop: '8px' }} onClick={() => { setSearched(false); setJourneys(null); setPreviewJourney?.(null); }}>Back to Search</button>
        </div>
        <div className='scrollWrap'>
          {searching ? <p>Searching...</p> : journeys!.map((e, i) => <JourneyEntry key={i} journey={e} setPreviewJourney={setPreviewJourney!} setSelectedJourney={setSelectedJourney} />)}
        </div>
      </>
    )
  }

  const renderSelectedJourney = () => {
    return (
      <>
        <div className="results-header">
          <h2>Journey Details</h2>
          <button style={{ marginTop: '8px' }} onClick={() => setSelectedJourney(null)}>Back to Results</button>
        </div>
        <div className='scrollWrap'>
          <JourneyEntry journey={selectedJourney!} setPreviewJourney={() => { }} setSelectedJourney={() => { }} />
          {selectedJourney!.legs.map((e, i) =>
            <div key={i} className="leg-detail">
              {(e.stops == null && e.route == null) ?
                <>
                  <h3>Walk</h3>
                  <p>{Math.ceil(new Date(new Date(e.arrivalTime).getTime() - new Date(e.departureTime).getTime()).getTime() / (1000 * 60))} minutes</p>
                </>
                : <>
                  <h3>{e.route?.gtfsRouteName}</h3>
                  {e.stops?.map((stop, sIdx) => 
                    <div key={sIdx} style={{ display: 'flex', gap: '16px', padding: '4px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <strong style={{ width: '45px', flexShrink: 0 }}>{stop.departureTime.slice(11, 16)}</strong>
                      <span>{stop.gtfsStopName}</span>
                    </div>
                  )}
                </>
              }
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      {searched ?
        <>
          {selectedJourney ? renderSelectedJourney() : renderJournies()}
        </>
        : renderForm()
      }
    </>
  )
}
