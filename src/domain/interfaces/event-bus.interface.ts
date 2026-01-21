export interface IEventBus {
  publish(event: any): Promise<void>;
}
