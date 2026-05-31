import React from 'react'
import type { Journey } from './types'

export const JourneyEntry = ({journey, setSelectedJourney}: {journey: Journey, setSelectedJourney: (state: Journey | null) => void}) => {
    const now = new Date().getTime()
    const departureTime = new Date(journey.departureTime).getTime()
    const hasDeparted = now > departureTime
    const minutesUntilDeparture = Math.round((departureTime - now) / (1000*60))
    const departureHour = journey.departureTime.split("T")[1].slice(0,5)
    const arrivalHour = journey.arrivalTime.split("T")[1].slice(0,5)

    return( 
        <div onMouseEnter={() => setSelectedJourney(journey)} className='journeyEntry'>
        {
            hasDeparted ? 
            <>
            <p>Already departed</p>
            <h2>{departureHour}</h2>
            </>
            :
            <>
            {minutesUntilDeparture < 60 ?
            <>
                <p>Departure in</p>
                <h2>{minutesUntilDeparture} min</h2>
            </>
            :
            <>
                <p>Departs</p>
                <h2>{departureHour}</h2>
            </>
            }
            </>
        }
        <div className='vehicles'>
            {journey.legs.filter(e=>e.legType == "Vehicle").map(j => <div className={j.route?.vehicleType}>{j.route?.gtfsRouteName}</div>)}
        </div>
        <div className='times'>
            <div className='departureTime'>{departureHour}</div>
            <div className='arrivalTime'>{arrivalHour}</div>
        </div>
        </div>
    )
}
