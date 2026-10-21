import data from '../../data/first-crossing.level.json';
import holdingData from '../../data/holding-pier.level.json';
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
