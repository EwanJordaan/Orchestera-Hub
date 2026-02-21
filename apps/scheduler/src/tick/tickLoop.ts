export function createTickLoop() {
  return {
    async tick() {
      console.log("scheduler tick");
    }
  };
}
