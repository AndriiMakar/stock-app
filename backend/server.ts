import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import generatePrice from './src/classes/PriceSimulator';
import stockList from './data/stock_list.json';
import { UPDATE_STOCKS_INTERVAL, PORT } from './src/constants';
import { iClientInfo } from './src/types';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Serve stock list
app.get('/api/stocks', (req, res) => {
  res.json(stockList);
});

// Initialize Socket.IO server with CORS settings
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Map to store client subscriptions
const clients: Map<string, iClientInfo> = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  /**
   * Handle 'subscribe' events from clients
   * Clients send an array of stock symbols they wish to subscribe to
   * This handler updates the rooms the client is in accordingly
   * 
   * @param stocks - Array of stock symbols to subscribe to
   */
  socket.on('subscribe', (stocks: string[]) => {
    console.log(`Client ${socket.id} is subscribing to: ${stocks.join(', ')}`);

    // Retrieve previous subscription info
    const previousClientInfo = clients.get(socket.id);
    const previousStocks = previousClientInfo?.stocks || [];

    // Convert arrays to sets for efficient lookup
    const previousStocksSet = new Set(previousStocks);
    const newStocksSet = new Set(stocks);

    // Determine which stocks to add (new subscriptions)
    const stocksToAdd = stocks.filter((stock) => !previousStocksSet.has(stock));

    // Determine which stocks to remove
    const stocksToRemove = previousStocks.filter((stock) => !newStocksSet.has(stock));

    // Remove the client from rooms that are no longer subscribed
    stocksToRemove.forEach((stock) => {
      socket.leave(stock);
      console.log(`Client ${socket.id} left room: ${stock}`);
    });

    // Add the client to new stock rooms
    stocksToAdd.forEach((stock) => {
      socket.join(stock);
      console.log(`Client ${socket.id} joined room: ${stock}`);
    });

    // Update the client's subscription info
    clients.set(socket.id, { stocks });
  });

    /**
   * Handle client disconnections.
   * Cleans up the client's subscription info
   * 
   * @param reason - Reason for disconnection
   */
    socket.on('disconnect', (reason: string) => {
      console.log(`Client disconnected: ${socket.id} | Reason: ${reason}`);
  
      // Remove the client's subscription info from the map
      clients.delete(socket.id);
    });
  });

function updateStockPrices () {
  Object.keys(stockList).forEach((symbol) => {
    const newPrice = generatePrice(symbol);
    /**
     * Broadcast the updated stock prices rooms
     * This ensures that all subscribed clients receive the same updates simultaneously
   */
    io.to(symbol).emit('priceUpdate', { [symbol]: newPrice });
  });
}

setInterval(updateStockPrices, UPDATE_STOCKS_INTERVAL);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});