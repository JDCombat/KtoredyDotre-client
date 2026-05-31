import { useEffect, useState } from 'react'
import type { Journey } from './types'
import busIcon from "./assets/bus-svgrepo-com.svg"
import tramIcon from "./assets/tram-svgrepo-com.svg"

export const JourneyEntry = ({journey, setSelectedJourney, setPreviewJourney}: {journey: Journey, setPreviewJourney: (state: Journey | null) => void, setSelectedJourney: (state: Journey | null) => void}) => {
    const [nowTime, setNowTime] = useState<number>(new Date().getTime())

    const departureTime = new Date(journey.departureTime).getTime()
    const minutesUntilDeparture = Math.ceil((departureTime - nowTime) / (1000*60))
    const hasDeparted = nowTime > (departureTime + 1000)
    const departureHour = journey.departureTime.split("T")[1].slice(0,5)
    const arrivalHour = journey.arrivalTime.split("T")[1].slice(0,5)

    useEffect(() => {
        let intervalId: number;

        const now = new Date();
        const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

        const timeoutId = setTimeout(() => {
            setNowTime(new Date().getTime()); 
            intervalId = setInterval(() => {
                setNowTime(new Date().getTime());
            }, 60 * 1000);

        }, msUntilNextMinute);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, []);

    return( 
        <div onMouseEnter={() => setPreviewJourney(journey)} onClick={() => setSelectedJourney(journey)} className='journeyEntry'>
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

            {!(journey.legCount == 1 && journey.legs[0].legType == "Foot") ?
            journey.legs.filter(e=>e.legType == "Vehicle").map((j, i) =>
                <div key={i} className={j.route?.vehicleType}>
                     <img width={16} height={20} src={j.route?.vehicleType == "Bus" ? busIcon: tramIcon} alt={j.route?.vehicleType} />
                    <span>{j.route?.gtfsRouteName}</span>
                </div>
                )
            : <div>
                <p>Pieszo</p>
            </div>
            }
        </div>
        <div className='times'>
            <div className='departureTime'>{departureHour}</div>
            <div className='arrivalTime'>{arrivalHour}</div>
        </div>
        </div>
    )
}
