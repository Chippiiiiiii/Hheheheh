const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

let auction = {
    basePrice: 1000,
    highestBid: 0,
    highestTeam: "",
    teams: {},
    initialCapital: 10000,
    roundTime: 60,
    timeLeft: 60,
    timerRunning: false,
    roundEnded: false,
    lastWinner: "",
    lastWinningBid: 0,
    history: []
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

// ADMIN SETTINGS
app.post("/settings", (req, res) => {
    const { basePrice, capital, roundTime } = req.body;

    auction.basePrice = basePrice;
    auction.initialCapital = capital;
    auction.roundTime = roundTime;
    auction.timeLeft = roundTime;

    res.json({ success: true });
});

// START ROUND
app.post("/start", (req, res) => {

    auction.roundEnded = false;
    auction.lastWinner = "";
    auction.lastWinningBid = 0;
    auction.highestBid = 0;
    auction.highestTeam = "";

    if (!auction.timerRunning) {
        auction.timerRunning = true;
        auction.timeLeft = auction.roundTime;

        const interval = setInterval(() => {
            auction.timeLeft--;

            if (auction.timeLeft <= 0) {
                clearInterval(interval);
                auction.timerRunning = false;
                endRound();
            }
        }, 1000);
    }

    res.json({ success: true });
});

// PLACE BID (₹1 increment allowed)
app.post("/bid", (req, res) => {
    const { teamName, amount } = req.body;

    if (!auction.timerRunning)
        return res.json({ error: "Round not active" });

    if (!auction.teams[teamName])
        return res.json({ error: "Team not registered" });

    if (amount < auction.basePrice)
        return res.json({ error: "Below base price" });

    if (amount <= auction.highestBid)
        return res.json({ error: "Bid must be higher than current highest bid" });

    if (amount > auction.teams[teamName].capital)
        return res.json({ error: "Not enough capital" });

    auction.highestBid = amount;
    auction.highestTeam = teamName;
    auction.teams[teamName].bid = amount;

    res.json({ success: true });
});

// END ROUND
function endRound() {

    auction.roundEnded = true;

    if (auction.highestTeam) {

        auction.history.push({
            team: auction.highestTeam,
            bid: auction.highestBid
        });

        auction.teams[auction.highestTeam].capital -= auction.highestBid;
    }

    // RESET ALL BIDS
    for (let team in auction.teams) {
        auction.teams[team].bid = 0;
    }

    auction.lastWinner = auction.highestTeam;
    auction.lastWinningBid = auction.highestBid;

    auction.highestBid = 0;
    auction.highestTeam = "";
}

app.post("/end", (req, res) => {
    endRound();
    res.json({ success: true });
});

app.get("/data", (req, res) => {
    res.json(auction);
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
