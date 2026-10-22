import data from '../../data/first-crossing.level.json';
import holdingData from '../../data/holding-pier.level.json';
import bellwaterData from '../../data/bellwater.level.json';
export type Level = Pick<
  typeof data,
  | 'id'
  | 'title'
  | 'rules'
  | 'world'
  | 'nodes'
  | 'edges'
  | 'piers'
  | 'passengers'
  | 'objective'
  | 'validation'
> & {
  start: { boatNodeId: string; aboard: string[]; waitingByPier: Record<string, string[]> };
  names?: { nodes?: Record<string, string>; passengers?: Record<string, string> };
};
export const level: Level = data;
export const holdingPier: Level = holdingData;
export const bellwater: Level = bellwaterData;
export const nodeNames: Record<string, string> = {
  harbor: 'Harbor',
  cut: 'Shallow Cut',
  'sheep-pier': 'Sheep Pier',
  'outer-east': 'East Buoy',
  'outer-south': 'South Buoy',
  'outer-west': 'West Buoy',
  stone: 'Stone Pier',
  shallows: 'Shallows',
  'rabbit-pier': 'Rabbit Pier',
};
export const passengerNames: Record<string, string> = {
  'rabbit-1': 'Pip · rabbit',
  'rabbit-2': 'Rue · rabbit',
  'sheep-1': 'Moss · sheep',
};
export function nodeName(id: string, l: Level = level): string {
  return l.names?.nodes?.[id] ?? nodeNames[id] ?? id;
}
export function passengerName(id: string, l: Level = level): string {
  return l.names?.passengers?.[id] ?? passengerNames[id]?.split(' ·')[0] ?? id;
}
export function passengerLabel(id: string, l: Level = level): string {
  const species = l.passengers.find((p) => p.id === id)?.species;
  return `${passengerName(id, l)}${species ? ` · ${species}` : ''}`;
}
export function levelNames(l: Level): {
  nodeNames: Record<string, string>;
  passengerNames: Record<string, string>;
} {
  return {
    nodeNames: Object.fromEntries(l.nodes.map((n) => [n.id, nodeName(n.id, l)])),
    passengerNames: Object.fromEntries(l.passengers.map((p) => [p.id, passengerLabel(p.id, l)])),
  };
}
