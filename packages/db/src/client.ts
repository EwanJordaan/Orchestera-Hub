export type DbClient = {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
};

export function createDbClient(): DbClient {
  return {
    async query<T>(_sql: string, _params?: unknown[]) {
      return [] as T[];
    }
  };
}
