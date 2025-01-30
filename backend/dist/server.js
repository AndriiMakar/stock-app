"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const PriceSimulator_1 = __importDefault(require("./src/classes/PriceSimulator"));
const stock_list_json_1 = __importDefault(require("./data/stock_list.json"));
const constants_1 = require("./src/constants");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', // Frontend URL
    methods: ['GET', 'POST']
}));
app.use(express_1.default.json());
// Serve stock list
app.get('/api/stocks', (req, res) => {
    res.json(stock_list_json_1.default);
});
// Initialize Socket.IO server with CORS settings
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});
// Map to store client subscriptions
const clients = new Map();
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    /**
     * Handle 'subscribe' events from clients
     * Clients send an array of stock symbols they wish to subscribe to
     * This handler updates the rooms the client is in accordingly
     *
     * @param stocks - Array of stock symbols to subscribe to
     */
    socket.on('subscribe', (stocks) => {
        console.log(`Client ${socket.id} is subscribing to: ${stocks.join(', ')}`);
        // Retrieve previous subscription info
        const previousClientInfo = clients.get(socket.id);
        const previousStocks = (previousClientInfo === null || previousClientInfo === void 0 ? void 0 : previousClientInfo.stocks) || [];
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
    socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id} | Reason: ${reason}`);
        // Remove the client's subscription info from the map
        clients.delete(socket.id);
    });
});
function updateStockPrices() {
    Object.keys(stock_list_json_1.default).forEach((symbol) => {
        const newPrice = (0, PriceSimulator_1.default)(symbol);
        /**
         * Broadcast the updated stock prices rooms
         * This ensures that all subscribed clients receive the same updates simultaneously
       */
        io.to(symbol).emit('priceUpdate', { [symbol]: newPrice });
    });
}
setInterval(updateStockPrices, constants_1.UPDATE_STOCKS_INTERVAL);
// Start the server
server.listen(constants_1.PORT, () => {
    console.log(`Server is running on port ${constants_1.PORT}`);
});
