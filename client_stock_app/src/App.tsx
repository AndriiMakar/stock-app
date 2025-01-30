import React, { useEffect, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import { Container, Box, CssBaseline } from '@mui/material';
import Grid from '@mui/material/Grid2';

// Import custom components
import StockList from './components/StockList';
import ConnectionStatus from './components/ConnectionStatus';
import ErrorNotification from './components/ErrorNotification';
import PriceList from './components/PriceList';

// Import Socket.IO client
import socket from './configuration/socket';
import { useRunWebworker } from './hooks/useRunWebworker';

/**
 * The main App component that manages stock selections,
 * communicates with the Web Worker, and handles socket connections
 */
const App: React.FC = () => {
  // State to manage selected stocks
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  
  // State to store the latest prices of selected stocks
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  // State to track the connection status
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('connecting');
  
  // State to hold error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * useRef to store the Web Worker instance
   * This ensures that the worker persists across re-renders
   */
  const priceWorkerRef = useRef<Worker | null>(null);

  /**
   * Debounced function to emit 'subscribe' events to the server
   * Prevents excessive emissions when selecting/deselecting stocks rapidly
   */
  const debounceSubscribe = useRef(
    debounce((stocks: string[]) => {
      socket.emit('subscribe', stocks);
      console.log(`Subscribed to stocks: ${stocks.join(', ')}`);
    }, 300) // 300ms debounce interval
  ).current;

  useRunWebworker(priceWorkerRef, setPrices, setErrorMessage);

  /**
   * Effect to handle changes in selectedStocks
   * Emits 'subscribe' events to the server with debouncing
   */
  useEffect(() => {
    console.log('Selected stocks changed:', selectedStocks);
    debounceSubscribe(selectedStocks);
  }, [selectedStocks, debounceSubscribe]);
  
  // Listener for 'priceUpdate' events
  const handlePriceUpdate = (data: Record<string, number>) => {
    // console.log('handlePriceUpdate:', data);
    // Send data to the Web Worker
    if (priceWorkerRef.current) {
      priceWorkerRef.current.postMessage(data);
      // console.log('priceWorkerRef:', data);
    }
  };

  /**
   * Effect to listen for 'priceUpdate' events from the server
   * Sends received data to the Web Worker for processing
   */
  useEffect(() => {
    // Attach the event listener
    socket.on('priceUpdate', handlePriceUpdate);

    // Cleanup by removing the listener when the component unmounts
    return () => {
      socket.off('priceUpdate', handlePriceUpdate);
    };
  }, []);

  /**
   * Handler for successful connection
   * Updates connection status and re-subscribes to selected stocks
  */
  const handleConnect = () => {
    console.log('Connected to server');
    setConnectionStatus('connected');
    setErrorMessage(null); // Clear any previous errors

    // Re-subscribe to selected stocks upon reconnection
    socket.emit('subscribe', selectedStocks);
    console.log('Re-subscribed to stocks upon reconnection:', selectedStocks);
  };

  /**
   * Handler for disconnection events
   * Updates connection status and attempts to reconnect if necessary
   * @param reason - Reason for disconnection
   */
  const handleDisconnect = (reason: string) => {
    console.warn(`Disconnected from server: ${reason}`);
    setConnectionStatus('disconnected');

    if (reason === 'io server disconnect') {
      // The disconnection was initiated by the server, attempt to reconnect manually
      socket.connect();
    }
  };

  /**
   * Handler for connection errors
   * Logs the error and updates the connection status and error message
   * @param err - The error encountered
   */
  const handleConnectError = (err: Error) => {
    console.error('Connection Error:', err.message);
    setConnectionStatus('error');
    setErrorMessage(err.message);
  };
  
  /**
   * Effect to handle socket connection events
   * Updates connection status and manages subscriptions upon reconnection
   */
  useEffect(() => {
    // Attach socket event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Cleanup by removing event listeners when the component unmounts
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [selectedStocks]);

  /**
   * Effect to initiate the socket connection when the component mounts
   */
  useEffect(() => {
    // Connect to the Socket.IO server
    socket.connect();

    /**
     * Cleanup function to disconnect from the server when the component unmounts
     * Also cancels any pending debounced 'subscribe' calls
     */
    return () => {
      socket.disconnect();
      debounceSubscribe.cancel(); // Cancel any pending debounced calls
    };
  }, [debounceSubscribe]);

  /**
   * Handler to retry the socket connection
   * Clears any existing error messages and attempts to reconnect
   */
  const handleRetry = () => {
    setConnectionStatus('connecting');
    setErrorMessage(null);
    socket.connect();
  };

  return (
    <>
      <CssBaseline />

      <Container maxWidth="xl">
        <Box my={4}>
          <ConnectionStatus status={connectionStatus} />

          {errorMessage && <ErrorNotification message={errorMessage} onRetry={handleRetry} />}

          <Grid container spacing={2} columns={16}>
            <Grid size={8}>
            <StockList onSelect={setSelectedStocks} />
            </Grid>
            <Grid size={8}>
            <PriceList prices={prices} selectedStocks={selectedStocks} />
            </Grid>
          </Grid> 
        </Box>
      </Container>
    </>
  );
};

export default App;
