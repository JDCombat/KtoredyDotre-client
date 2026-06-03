import { useState, useEffect, type ChangeEvent } from 'react'
import type { Journey, JourneySearchOverrides, Route } from './types'

export type Stop = { gtfsStopId: number; gtfsStopName: string; stopSlug: string; position: [number, number] }

const getLocalISOString = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export function useJourneyPlanner() {
  const api_url = import.meta.env.VITE_BACKEND_URL 
    ? `http://${import.meta.env.VITE_BACKEND_URL}` 
    : ""

  const [searchedStops, setSearchedStops] = useState<Stop[]>()
  const [stopType, setStopType] = useState<"target" | "start">("start")

  const [startStop, setStartStop] = useState<string | null>(null)
  const [targetStop, setTargetStop] = useState<string | null>(null)

  const [startPosition, setStartPosition] = useState<[number, number] | null>(null)
  const [targetPosition, setTargetPosition] = useState<[number, number] | null>(null)

  const [startInput, setStartInput] = useState<string>("")
  const [targetInput, setTargetInput] = useState<string>("")

  const [searched, setSearched] = useState<boolean>(false)
  const [searching, setSearching] = useState<boolean>(false)
  const [journeys, setJourneys] = useState<Journey[] | null>(null)
  const [previewJourney, setPreviewJourney] = useState<Journey | null>(null)
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)

  const [map, setMap] = useState<Map<string, string>>(new Map<string, string>())

  const [date, setDate] = useState<string>(getLocalISOString())

  useEffect(() => {
    if (previewJourney) {
      setStartPosition(previewJourney.startPosition)
      setTargetPosition(previewJourney.targetPosition)
    }
  }, [previewJourney])

  const handleTypeStop = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    if (stopType === "start") {
      setStartInput(input)
    } else if (stopType === "target") {
      setTargetInput(input)
    }
    if (input.length === 1) {
      return
    }
    if (input === "") {
      setSearchedStops([])
      if (stopType === "start") {
        setStartStop(null)
        setStartPosition(null)
      } else if (stopType === "target") {
        setTargetStop(null)
        setTargetPosition(null)
      }
      return
    }
    const res = await fetch(`${api_url}/api/stops/byNameContaining/${input}`)
    const data = await res.json()
    const uniqueSlugs = new Map((data.items as Stop[]).map(e => [e.stopSlug, e]))
    const array = Array.from(uniqueSlugs.values())
    const map = new Map<string, string>()
    for (const stop of array){
      const routesRes = await fetch(`${api_url}/api/routes/passingThroughStop/${stop.stopSlug}?pageSize=10`)
      const routesData = await routesRes.json()
      map.set(stop.stopSlug, (routesData.items as Route[]).map(e=>e.gtfsRouteName).join(", "))
    }
    setMap(map)
    setSearchedStops(array)
  }

  const handleSearchJourney = async (payload?: FormData | JourneySearchOverrides) => {
    setSelectedJourney(null)
    setPreviewJourney(null)

    setSearched(true)
    setSearching(true)
    const overrides = (payload instanceof FormData || !payload) ? {} : payload;

    const resolvedStartStop = overrides.newStartStop !== undefined ? overrides.newStartStop : startStop;
    const resolvedTargetStop = overrides.newTargetStop !== undefined ? overrides.newTargetStop : targetStop;
    
    const resolvedStartPos = overrides.newStartPos !== undefined ? overrides.newStartPos : startPosition;
    const resolvedTargetPos = overrides.newTargetPos !== undefined ? overrides.newTargetPos : targetPosition;
    const res = await fetch(`${api_url}/api/journey/findMultiple`,
      {
        method: "post",
        body: JSON.stringify({
          startStopSlug: resolvedStartStop,
          targetStopSlug: resolvedTargetStop,
          startPosition: resolvedStartStop == null ? resolvedStartPos : null,
          targetPosition: resolvedTargetStop == null ? resolvedTargetPos : null,
          departureTime: date,
          MinTransferTime: 240
        }),
        headers: { "Content-Type": "application/json" }
      }
    )
    const json = await res.json()
    if (json?.status === 500) {
      alert(json.title)
      setSearching(false)
      return
    }
    setJourneys(json)
    setPreviewJourney(json[0])
    setSearching(false)
  }

  const handleSelectStop = (type: "target" | "start", stop: Stop) => {
    if (type === "start") {
      setStartStop(stop.stopSlug)
      setStartInput(stop.gtfsStopName)
      setStartPosition(stop.position)
    } else if (type === "target") {
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

  return {
    searchedStops,
    setSearchedStops,
    stopType,
    setStopType,
    startStop,
    setStartStop,
    targetStop,
    setTargetStop,
    startPosition,
    setStartPosition,
    targetPosition,
    setTargetPosition,
    startInput,
    setStartInput,
    targetInput,
    setTargetInput,
    searched,
    setSearched,
    searching,
    setSearching,
    journeys,
    setJourneys,
    previewJourney,
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
  }
}
