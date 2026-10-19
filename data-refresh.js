globalThis.createYeetDataRefresher = function ({ fetcher = fetch, onData, onError = () => {}, onSuccess = () => {} }) {
  let inFlight = null;
  let latest = null;
  return function refresh() {
    if (inFlight) return inFlight;
    inFlight = (async () => {
      try {
        const response = await fetcher(`data/summary.json?refresh=${Date.now()}`, {
          cache: "no-store", signal: AbortSignal.timeout(20000),
        });
        if (!response.ok) throw new Error(`Dashboard HTTP ${response.status}`);
        const data = await response.json();
        const timestamp = Date.parse(data.meta?.generatedAt);
        if (!Number.isFinite(timestamp) || !Array.isArray(data.cells) || !data.dimensions || !data.summary) {
          throw new Error("Invalid dashboard data");
        }
        if (latest !== null && timestamp < latest) throw new Error("Publication is older than the displayed data");
        if (timestamp !== latest) {
          onData(data);
          latest = timestamp;
        }
        onSuccess();
      } catch (error) { onError(error); }
      finally { inFlight = null; }
    })();
    return inFlight;
  };
};
