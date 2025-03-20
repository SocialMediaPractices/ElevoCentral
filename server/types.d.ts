declare global {
  var broadcastUpdate: (entityType: string, entityId: number | string, data: any) => void;
  
  namespace NodeJS {
    interface Global {
      broadcastUpdate: (entityType: string, entityId: number | string, data: any) => void;
    }
  }
}

export {};