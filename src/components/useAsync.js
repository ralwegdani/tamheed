// Loads data once when a page opens (or when deps change) and tracks
// loading and error states. Built with useState + useEffect from the React lecture.
//   const { data, loading, error, reload } = useAsync(() => getUserResults(uid), [uid]);
import { useState, useEffect, useCallback } from 'react';

export default function useAsync(load, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await run());
    } catch (err) {
      setError(err.toText ? err.toText() : 'db.generic');
    }
    setLoading(false);
  }, [run]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    run()
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err.toText ? err.toText() : 'db.generic'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false; // the page closed before the data arrived
    };
  }, [run]);

  return { data, loading, error, reload, setData };
}
