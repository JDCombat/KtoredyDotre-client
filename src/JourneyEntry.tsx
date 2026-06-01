import { useEffect, useState } from 'react'
import type { Journey } from './types'
import busIcon from "./assets/bus-svgrepo-com.svg"
import tramIcon from "./assets/tram-svgrepo-com.svg"

const WalkIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#4b5563'}}>
        <circle cx="12" cy="5" r="1.5" stroke="none" fill="currentColor"></circle>
        <path d="M9 10l-2 3M12 10v4l-2 6M12 14l3 5M12 10l3-2 2 2"></path>
    </svg>
);

export const JourneyEntry = ({journey, setSelectedJourney, setPreviewJourney}: {journey: Journey, setPreviewJourney: (state: Journey | null) => void, setSelectedJourney: (state: Journey | null) => void}) => {
    const [nowTime, setNowTime] = useState<number>(new Date().getTime())

    const departureTime = new Date(journey.departureTime).getTime()
    const minutesUntilDeparture = Math.ceil((departureTime - nowTime) / (1000*60))
    const hasDeparted = nowTime > (departureTime + 1000)

    // Calculate overall time
    const totalDurationMs = new Date(journey.arrivalTime).getTime() - new Date(journey.departureTime).getTime();
    const totalDurationMinutes = Math.ceil(totalDurationMs / (1000 * 60));
    const totalDurationString = totalDurationMinutes >= 60 
        ? `${Math.floor(totalDurationMinutes / 60)} h ${String(totalDurationMinutes % 60).padStart(2, '0')} min` 
        : `${totalDurationMinutes} min`;

    // Calculate transit times (first vehicle start to last vehicle end)
    const vehicleLegs = journey.legs.filter(e => e.legType === "Vehicle");
    const firstVehicleLeg = vehicleLegs[0];
    const lastVehicleLeg = vehicleLegs[vehicleLegs.length - 1];

    const vehicleDepartureHour = firstVehicleLeg ? firstVehicleLeg.departureTime.split("T")[1].slice(0,5) : journey.departureTime.split("T")[1].slice(0,5);
    const vehicleArrivalHour = lastVehicleLeg ? lastVehicleLeg.arrivalTime.split("T")[1].slice(0,5) : journey.arrivalTime.split("T")[1].slice(0,5);

    const vehicleDepartureMs = firstVehicleLeg ? new Date(firstVehicleLeg.departureTime).getTime() : departureTime;
    const vehicleArrivalMs = lastVehicleLeg ? new Date(lastVehicleLeg.arrivalTime).getTime() : new Date(journey.arrivalTime).getTime();
    
    let transitDurationMinutes = Math.ceil((vehicleArrivalMs - vehicleDepartureMs) / (1000 * 60));
    if (transitDurationMinutes < 0) transitDurationMinutes = 0;

    // Calculate total walking time
    const walkingLegs = journey.legs.filter(e => e.legType === "Foot");
    const totalWalkMs = walkingLegs.reduce((acc, leg) => acc + (new Date(leg.arrivalTime).getTime() - new Date(leg.departureTime).getTime()), 0);
    const totalWalkMinutes = Math.ceil(totalWalkMs / (1000 * 60));

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
        <div onMouseEnter={() => setPreviewJourney(journey)} onClick={() => setSelectedJourney(journey)} className='jak-card'>
            <div className="jak-top-row">
                <div className="jak-departs">
                    {hasDeparted ? (
                        <>
                            <span className="jak-label">Already departed:</span>
                            <div className="jak-countdown">
                                <span className="jak-big" style={{fontSize: '1.8rem'}}>{vehicleDepartureHour}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="jak-label">Departs in:</span>
                            <div className="jak-countdown">
                                <span className="jak-big">{minutesUntilDeparture}</span><span className="jak-min">min</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="jak-vehicles">
                    {vehicleLegs.length > 0 ? vehicleLegs.map((j, i) => (
                        <div key={i} className="jak-vehicle-item">
                            <img width={18} height={18} src={j.route?.vehicleType === "Bus" ? busIcon : tramIcon} alt={j.route?.vehicleType} className="jak-icon" />
                            <div className="jak-badge">{j.route?.gtfsRouteName}</div>
                        </div>
                    )) : (
                        <div className="jak-vehicle-item">
                            <WalkIcon />
                            <span className="jak-min" style={{marginLeft: '4px'}}>Walk</span>
                        </div>
                    )}
                </div>

                <div className="jak-total-time">
                    {totalDurationString}
                </div>
            </div>

            <div className="jak-bottom-row">
                <div className="jak-pill green">{vehicleDepartureHour}</div>
                <div className="jak-duration">{transitDurationMinutes} min</div>
                <div className="jak-pill blue">{vehicleArrivalHour}</div>
                {totalWalkMinutes > 0 && (
                    <div className="jak-walk-info">
                        <WalkIcon />
                        <span>{totalWalkMinutes} min</span>
                    </div>
                )}
            </div>
        </div>
    )
}
