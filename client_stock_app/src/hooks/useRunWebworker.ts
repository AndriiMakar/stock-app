import { useEffect } from 'react';

export const useRunWebworker = (
    priceWorkerRef:  React.MutableRefObject<Worker | null>, 
    setPrices: (value: React.SetStateAction<Record<string, number>>) => void, 
    setErrorMessage: (value: React.SetStateAction<string | null>) => void
  ) => {
    /**
   * Initialize the Web Worker and set up message handlers
   * This effect runs once when the component mounts
   */
    useEffect(() => {
      // Instantiate the Web Worker using the native Worker API
      const worker = new Worker(new URL('../workers/PriceWorker.worker.ts', import.meta.url));
  
      // Assign the worker to the ref for persistent access
      priceWorkerRef.current = worker;
  
      /**
       * Handler for messages received from the Web Worker
       * Updates the prices state with the latest data
       */
      worker.onmessage = (event: MessageEvent<Record<string, number>>) => {
        const data = event.data;
        // console.log('onmessage:', data);
        
        // Update the prices state by merging new data
        setPrices((prevPrices) => ({
          ...prevPrices,
          ...data,
        }));
      };
  
      /**
       * Handler for errors encountered by the Web Worker
       * Logs the error and updates the errorMessage state
       */
      worker.onerror = (error: ErrorEvent) => {
        console.error('Worker encountered an error:', error);
        setErrorMessage('An error occurred in the price worker.');
      };
  
      /**
       * Cleanup function to terminate the Web Worker when the component unmounts
       * Prevents memory leaks and ensures proper resource management
       */
      return () => {
        if (priceWorkerRef.current) {
          priceWorkerRef.current.terminate();
          priceWorkerRef.current = null;
        }
      };
    }, []); // Empty dependency array ensures this runs only once
}