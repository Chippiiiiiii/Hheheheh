const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let auction = {
  active: false,
  basePrice: 0,
  endTime: null,
  bids: {},
  lastResult: null
};

io.on("connection", (socket) => {

  // TEAM JOIN
  socket.on("joinTeam", (teamId) => {
    socket.join(teamId);

    if (!auction.bids[teamId]) {
      auction.bids[teamId] = {
        amount: auction.basePrice,
        timestamp: null
      };
    }

    socket.emit("updateBid", auction.bids[teamId].amount);
  });

  // ADMIN START AUCTION
  socket.on("startAuction", ({ basePrice, duration }) => {
    auction.active = true;
    auction.basePrice = basePrice;
    auction.endTime = Date.now() + duration * 1000;
    auction.bids = {};
    auction.lastResult = null;

    io.emit("auctionStarted", {
      basePrice,
      endTime: auction.endTime
    });
  });

  // TEAM PLACE BID
  socket.on("placeBid", ({ teamId, amount }) => {

    if (!auction.active) return;
    if (Date.now() > auction.endTime) return;

    const currentBid = auction.bids[teamId]?.amount || auction.basePrice;

    if (amount > currentBid) {

      auction.bids[teamId] = {
        amount,
        timestamp: Date.now()
      };

      socket.emit("updateBid", amount);

      // Send only to admin
      io.emit("adminUpdate", auction.bids);
    }
  });

  // AUTO CLOSE CHECK
  setInterval(() => {

    if (auction.active && Date.now() > auction.endTime) {

      auction.active = false;

      let winner = null;
      let highest = 0;
      let earliestTime = Infinity;

      for (let team in auction.bids) {
        const bid = auction.bids[team];

        if (
          bid.amount > highest ||
          (bid.amount === highest && bid.timestamp < earliestTime)
        ) {
          highest = bid.amount;
          winner = team;
          earliestTime = bid.timestamp;
        }
      }

      auction.lastResult = { winner, highest };

      io.emit("auctionEnded", { winner, highest });
    }

  }, 1000);

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
