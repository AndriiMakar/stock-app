import { useEffect, useState } from 'react';

interface iFetchFn {
  (): Promise<any>;
}

interface iUseFetchReturn<T> {
  isFetching: boolean;
  fetchedData: T;
  setFetchedData: React.Dispatch<React.SetStateAction<T>>;
  error: { message: string } | null;
}

export function useFetch<T>(fetchFn: iFetchFn, initialValue: T): iUseFetchReturn<T> {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState({ message: '' });
  const [fetchedData, setFetchedData] = useState(initialValue);

  useEffect(() => {
    async function fetchData() {
      setIsFetching(true);
      try {
        const data = await fetchFn();
        setFetchedData(data);
      } catch (error) {
        setError({ message: (error as Error).message || 'Failed to fetch data.' });
      } finally {
        setIsFetching(false);
      }
    }

    fetchData();
  }, [fetchFn]);

  return {
    isFetching,
    fetchedData,
    setFetchedData,
    error
  }
}