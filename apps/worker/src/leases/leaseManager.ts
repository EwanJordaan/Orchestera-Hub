export function createLeaseManager() {
  return {
    async acquire(_key: string) {
      return { acquired: true };
    },
    async release(_key: string) {
      return;
    }
  };
}
