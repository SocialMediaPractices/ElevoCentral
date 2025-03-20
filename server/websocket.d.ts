import { WebSocket } from 'ws';

declare module 'ws' {
  interface WebSocket {
    entityId?: number | string;
    entityType?: string;
  }
}