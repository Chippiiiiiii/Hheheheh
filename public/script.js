let savedTeam = localStorage.getItem("teamName");

// ================= REGISTER =================
async function register() {

    const input = document.getElementById("teamName");
    if (!input) return;

    const teamName = input.value.trim();
    if (!teamName) return alert("Enter team name");

    await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName })
    });

    localStorage.setItem("teamName", teamName);
    savedTeam = teamName;

    const regCard = document.getElementById("registerCard");
    if (regCard) regCard.style.display = "none";

    const bidCard = document.getElementById("bidCard");
    if (bidCard) bidCard.style.display = "block";

    alert("Registered Successfully");
}

// ================= PLACE BID =================
async function bid() {

    const amountInput = document.getElementById("bidAmount");
    if (!amountInput) return;

    const amount = parseInt(amountInput.value);

    const res = await fetch("/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: savedTeam, amount })
    });

    const data = await res.json();
    if (data.error) alert(data.error);
}

// ================= ADMIN SETTINGS =================
async function saveSettings() {

    const base = document.getElementById("basePrice");
    const cap = document.getElementById("capital");
    const time = document.getElementById("roundTime");

    if (!base || !cap || !time) return;

    await fetch("/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            basePrice: parseInt(base.value),
            capital: parseInt(cap.value),
            roundTime: parseInt(time.value)
        })
    });

    alert("Settings Saved");
}

async function startRound() {
    await fetch("/start", { method: "POST" });
}

async function endRound() {
    await fetch("/end", { method: "POST" });
}

// ================= LOAD DATA =================
async function loadData() {

    const res = await fetch("/data");
    const data = await res.json();

    // ADMIN PAGE
    const adminTable = document.getElementById("adminTable");
    if (adminTable) {

        const highest = document.getElementById("highestTeam");
        if (highest) {
            highest.innerText =
                "Highest Bidder: " + (data.highestTeam || "None");
        }

        const timer = document.getElementById("timer");
        if (timer) {
            timer.innerText =
                "Time Left: " + data.timeLeft + "s";
        }

        const tbody = adminTable.querySelector("tbody");
        tbody.innerHTML = "";

        let sno = 1;

        for (let team in data.teams) {

            const isHighest =
                team === data.highestTeam ? "Yes" : "No";

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

    // TEAM PAGE
    if (savedTeam && data.teams[savedTeam]) {

        const teamInfo = document.getElementById("teamInfo");
        if (teamInfo) {
            teamInfo.innerHTML = `
                <div class="team-box">
                    <h2>${savedTeam}</h2>
                    <p>Capital: ₹${data.teams[savedTeam].capital}</p>
                    <p>Your Current Bid: ₹${data.teams[savedTeam].bid}</p>
                </div>
            `;
        }

        const winnerTable = document.getElementById("winnerTable");
        if (winnerTable) {

            const tbody = winnerTable.querySelector("tbody");
            tbody.innerHTML = "";

            data.history.forEach((item, index) => {
                tbody.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.team}</td>
                    </tr>
                `;
            });
        }
    }
}

setInterval(loadData, 1000);
