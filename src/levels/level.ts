import data from '../../data/first-crossing.level.json';
import holdingData from '../../data/holding-pier.level.json';
// Shared authored schema; the original JSON remains the baseline and default
// for rule callers. A session owns its level, never a mutable global selection.
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
};
export const level: Level = data;
export const holdingPier: Level = holdingData;
export const nodeNames: Record<string, string> = {
  harbor: 'Lighthouse harbor',
  cut: 'Shallow cut',
  'sheep-pier': 'Sheep pier',
  'outer-east': 'East buoy',
  'outer-south': 'South buoy',
  'outer-west': 'West buoy',
  stone: 'Stone Pier',
  shallows: 'Shallows',
  'rabbit-pier': 'Rabbit Pier',
};
export const passengerNames: Record<string, string> = {
  'rabbit-1': 'Pip · rabbit',
  'rabbit-2': 'Rue · rabbit',
  'sheep-1': 'Moss · sheep',
};
