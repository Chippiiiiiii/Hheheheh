let savedTeam = localStorage.getItem("teamName");

// REGISTER
async function register() {

    const teamName = document.getElementById("teamName").value.trim();
    if (!teamName) return alert("Enter team name");

    await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName })
    });

    localStorage.setItem("teamName", teamName);
    savedTeam = teamName;

    document.getElementById("registerCard").style.display = "none";
    document.getElementById("bidCard").style.display = "block";

    alert("Registered Successfully");
}

// PLACE BID
async function bid() {

    const amount = parseInt(document.getElementById("bidAmount").value);

    const res = await fetch("/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: savedTeam, amount })
    });

    const data = await res.json();
    if (data.error) alert(data.error);
}

// ADMIN SETTINGS
async function saveSettings() {

    const basePrice = parseInt(document.getElementById("basePrice").value);
    const capital = parseInt(document.getElementById("capital").value);
    const roundTime = parseInt(document.getElementById("roundTime").value);

    await fetch("/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basePrice, capital, roundTime })
    });

    alert("Settings Saved");
}

async function startRound() {
    await fetch("/start", { method: "POST" });
}

async function endRound() {
    await fetch("/end", { method: "POST" });
}

// LOAD DATA
async function loadData() {

    const res = await fetch("/data");
    const data = await res.json();

    // AUTO LOGIN IF REGISTERED
    if (savedTeam) {
        document.getElementById("registerCard")?.style.display = "none";
        document.getElementById("bidCard")?.style.display = "block";
    }

    // ADMIN PAGE
    if (document.getElementById("adminTable")) {

        document.getElementById("highestTeam").innerText =
            "Highest Bidder: " + (data.highestTeam || "None");

        document.getElementById("timer").innerText =
            "Time Left: " + data.timeLeft + "s";

        const tbody = document.querySelector("#adminTable tbody");
        tbody.innerHTML = "";

        let sno = 1;

        for (let team in data.teams) {
            const isHighest = team === data.highestTeam ? "Yes" : "No";

            tbody.innerHTML += `
                <tr>
                    <td>${sno}</td>
                    <td>${team}</td>
                    <td>₹${data.teams[team].bid}</td>
                    <td>${isHighest}</td>
                </tr>
            `;

            sno++;
        }
    }

    // TEAM PAGE INFO
    if (savedTeam && data.teams[savedTeam]) {

        document.getElementById("teamInfo").innerHTML = `
            <div class="team-box">
                <h2>${savedTeam}</h2>
                <p>Capital: ₹${data.teams[savedTeam].capital}</p>
                <p>Your Current Bid: ₹${data.teams[savedTeam].bid}</p>
            </div>
        `;
    }

    // WINNER TABLE (TEAM PAGE)
    if (document.getElementById("winnerTable")) {

        const winnerBody = document.querySelector("#winnerTable tbody");
        winnerBody.innerHTML = "";

        data.history.forEach((item, index) => {
            winnerBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.team}</td>
                </tr>
            `;
        });
    }
}

setInterval(loadData, 1000);
