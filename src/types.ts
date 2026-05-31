export type Position = [number, number];

export interface Route {
  gtfsRouteId: string;
  gtfsRouteName: string;
  vehicleType: string;
  color: string;
}

export interface JourneyStop {
  gtfsStopId: string;
  gtfsStopName: string;
  stopSlug: string;
  position: Position;
  departureTime: string;
  arrivalTime: string;
}

export interface ShapePoint {
  position: Position;
  sequence: number;
}

export interface Leg {
  legIndex: number;
  legType: "Foot" | "Vehicle";
  route: Route | null;
  gtfsTripId: string | null;
  gtfsStartStopId: string | null;
  gtfsTargetStopId: string | null;
  startStopSlug: string | null;
  targetStopSlug: string | null;
  startPosition: Position;
  targetPosition: Position;
  stops: JourneyStop[] | null;
  shape: ShapePoint[];
  departureTime: string;
  arrivalTime: string;
}

export interface Journey {
  startStopSlug: string | null;
  targetStopSlug: string | null;
  startPosition: Position;
  targetPosition: Position;
  legCount: number;
  legs: Leg[];
  departureTime: string;
  arrivalTime: string;
}