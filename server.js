// INITIAL SETTINGS
let basePrice = 1000;
let initialCapital = 10000;
let minIncrement = 100;

// Initialize data if not present
if (!localStorage.getItem("auctionData")) {
    let data = {
        highestBid: 0,
        highestTeam: "",
        teams: {}
    };
    localStorage.setItem("auctionData", JSON.stringify(data));
}

// TEAM REGISTER
function registerTeam() {
    let teamName = document.getElementById("teamName").value;
    let data = JSON.parse(localStorage.getItem("auctionData"));

    if (!data.teams[teamName]) {
        data.teams[teamName] = {
            capital: initialCapital,
            bid: 0
        };
    }

    localStorage.setItem("auctionData", JSON.stringify(data));
    alert("Team Registered!");
    updateTeamView(teamName);
}

// PLACE BID
function placeBid() {
    let teamName = document.getElementById("teamName").value;
    let bidAmount = parseInt(document.getElementById("bidAmount").value);
    let data = JSON.parse(localStorage.getItem("auctionData"));

    if (!data.teams[teamName]) {
        alert("Register first!");
        return;
    }

    if (bidAmount < basePrice) {
        alert("Bid cannot be less than base price!");
        return;
    }

    if (bidAmount < data.highestBid + minIncrement) {
        alert("Bid must be higher than current highest bid!");
        return;
    }

    if (bidAmount > data.teams[teamName].capital) {
        alert("Not enough capital!");
        return;
    }

    data.highestBid = bidAmount;
    data.highestTeam = teamName;
    data.teams[teamName].bid = bidAmount;

    localStorage.setItem("auctionData", JSON.stringify(data));
    alert("Bid placed!");
}

// ADMIN END AUCTION
function endAuction() {
    let data = JSON.parse(localStorage.getItem("auctionData"));

    if (data.highestTeam !== "") {
        data.teams[data.highestTeam].capital -= data.highestBid;
        data.teams[data.highestTeam].bid = 0;
    }

    data.highestBid = 0;
    data.highestTeam = "";

    localStorage.setItem("auctionData", JSON.stringify(data));
    alert("Auction Ended!");
}

// UPDATE ADMIN VIEW
function updateAdmin() {
    let data = JSON.parse(localStorage.getItem("auctionData"));
    let container = document.getElementById("adminTeams");

    if (!container) return;

    container.innerHTML = "";

    for (let team in data.teams) {
        container.innerHTML += `
            <div class="team-box">
                <h3>${team}</h3>
                <p>Capital: ₹${data.teams[team].capital}</p>
                <p>Current Bid: ₹${data.teams[team].bid}</p>
            </div>
        `;
    }

    document.getElementById("highestBid").innerText =
        "Highest Bid: ₹" + data.highestBid + " (" + data.highestTeam + ")";
}

// UPDATE TEAM VIEW
function updateTeamView(teamName) {
    let data = JSON.parse(localStorage.getItem("auctionData"));
    let info = document.getElementById("teamInfo");

    if (!info || !data.teams[teamName]) return;

    info.innerHTML = `
        <h3>${teamName}</h3>
        <p>Remaining Capital: ₹${data.teams[teamName].capital}</p>
        <p>Highest Bid: ₹${data.highestBid}</p>
    `;
}

// AUTO REFRESH
setInterval(updateAdmin, 1000);
