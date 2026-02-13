const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// GLOBAL AUCTION DATA
let auction = {
    basePrice: 1000,
    minIncrement: 100,
    highestBid: 0,
    highestTeam: "",
    teams: {},
    initialCapital: 10000
};

// REGISTER TEAM
app.post("/register", (req, res) => {
    const { teamName } = req.body;

    if (!auction.teams[teamName]) {
        auction.teams[teamName] = {
            capital: auction.initialCapital,
            bid: 0
        };
    }

    res.json({ success: true });
});

// PLACE BID
app.post("/bid", (req, res) => {
    const { teamName, amount } = req.body;

    if (!auction.teams[teamName]) {
        return res.json({ error: "Team not registered" });
    }

    if (amount < auction.basePrice) {
        return res.json({ error: "Below base price" });
    }

    if (amount < auction.highestBid + auction.minIncrement) {
        return res.json({ error: "Bid too low" });
    }

    if (amount > auction.teams[teamName].capital) {
        return res.json({ error: "Not enough capital" });
    }

    auction.highestBid = amount;
    auction.highestTeam = teamName;
    auction.teams[teamName].bid = amount;

    res.json({ success: true });
});

// GET DATA
app.get("/data", (req, res) => {
    res.json(auction);
});

// END AUCTION
app.post("/end", (req, res) => {
    if (auction.highestTeam) {
        auction.teams[auction.highestTeam].capital -= auction.highestBid;
        auction.teams[auction.highestTeam].bid = 0;
    }

    auction.highestBid = 0;
    auction.highestTeam = "";

    res.json({ success: true });
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
