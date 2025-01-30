/**
 * This file is treated as a module by TypeScript
 * The 'export {}' statement ensures that TypeScript recognizes it as a module rather than a global script
 */
export {};

// Object to store the latest prices of stocks
const latestPrices: Record<string, number> = {};

// Timer identifier for managing the throttle interval
let timerId: number | null = null;

// Throttle interval in milliseconds to control the frequency of updates sent to the main thread
const THROTTLE_INTERVAL = 100;

/**
 * Function to send the latest prices to the main thread
 * It uses postMessage to communicate with the main thread
 */
function sendLatestPrices() {
  postMessage(latestPrices);
  // Uncomment the line below for debugging purposes
  // console.log('Worker sent latest prices:', latestPrices);
  
  // Reset the timer ID after sending the message
  timerId = null;
}

/**
 * Event listener for messages received from the main thread
 * It updates the latestPrices object with incoming data and schedules a throttled send
 * @param event - The message event containing stock price updates
 */
onmessage = (event: MessageEvent<Record<string, number>>) => {
  const data = event.data;
  // Uncomment the line below for debugging purposes
  // console.log('onmessage data:', data);

  // Validate the incoming data structure
  if (isValidData(data)) {
    // Merge the incoming data with the latestPrices object
    Object.assign(latestPrices, data);

    // If no timer is active, start a new timer to send the aggregated data
    if (!timerId) {
      timerId = setTimeout(sendLatestPrices, THROTTLE_INTERVAL) as unknown as number;
    }
  } else {
    // Log an error if the received data is invalid
    console.error('Worker received invalid data:', data);
  }
};

/**
 * Helper function to validate the structure of incoming data
 * Ensures that the data is a non-null object with numeric values
 * @param data - The data to validate
 * @returns Boolean indicating whether the data is valid
 */
function isValidData(data: any): data is Record<string, number> {
  if (typeof data !== 'object' || data === null) return false;
  
  // Check that every value in the object is a number
  return Object.values(data).every((value) => typeof value === 'number');
}
