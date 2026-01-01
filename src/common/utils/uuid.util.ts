import { uuidv7 } from 'uuidv7';

export function generateId(): string {
  return uuidv7();
}

export function getTimestampFromId(uuid: string): number {
  const hex = uuid.replace(/-/g, '');
  const timestampHex = hex.substring(0, 12);
  return parseInt(timestampHex, 16);
}
