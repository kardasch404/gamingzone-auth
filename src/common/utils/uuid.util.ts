import { v7 as uuidv7 } from 'uuid';

export function generateId(): string {
  return uuidv7();
}

export function getTimestampFromId(uuid: string): number {
  const hex = uuid.replace(/-/g, '');
  const timestampHex = hex.substring(0, 12);
  return parseInt(timestampHex, 16);
}
