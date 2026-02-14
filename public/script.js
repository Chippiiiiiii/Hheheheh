let savedTeam = localStorage.getItem("teamName") || null;

window.register = async function () {
    const name = document.getElementById("teamName").value.trim();
    if (!name) return alert("Enter team name");

    const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: name })
    });

    const data = await res.json();

    if (data.success) {
        localStorage.setItem("teamName", name);
        savedTeam = name;
        updateLayout();
    }
};

window.bid = async function () {

    if (!savedTeam) return alert("Register first");

    const amount = parseInt(document.getElementById("bidAmount").value);

    const res = await fetch("/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: savedTeam, amount })
    });

    const data = await res.json();
    if (data.error) alert(data.error);
};

window.saveSettings = async function () {
    await fetch("/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            basePrice: parseInt(basePrice.value) || 0,
            capital: parseInt(capital.value) || 0,
            roundTime: parseInt(roundTime.value) || 0
        })
    });
};

window.startRound = async function () {
    await fetch("/start", { method: "POST" });
};

window.endRound = async function () {
    await fetch("/end", { method: "POST" });
};

window.goDashboard = async function () {
    await fetch("/activateDashboard", { method: "POST" });
};

function updateLayout() {
    const registerCard = document.getElementById("registerCard");
    const bidCard = document.getElementById("bidCard");
    const teamLabel = document.getElementById("teamLabel");

    if (savedTeam) {
        if (registerCard) registerCard.style.display = "none";
        if (bidCard) bidCard.style.display = "block";
        if (teamLabel) teamLabel.innerText = "Team name: " + savedTeam;
    }
}

async function loadData() {

    const res = await fetch("/data");
    const data = await res.json();

    const timer = document.getElementById("timer");
    if (timer) timer.innerText = "Time Left: " + data.timeLeft + "s";

    const teamTimer = document.getElementById("teamTimer");
    if (teamTimer) teamTimer.innerText = "Time Left: " + data.timeLeft + "s";

    const highest = document.getElementById("highestTeam");
    if (highest)
        highest.innerText =
            "Highest Bidder: " + (data.highestTeam || "None");


    // ===== LIVE ROUND TABLE =====
    const roundDetailsContainer =
        document.getElementById("roundDetailsContainer");

    if (roundDetailsContainer) {

        roundDetailsContainer.innerHTML = "";

        if (data.timerRunning) {

            let html = `
            <div class="round-card">
                <h3>Round ${data.roundNumber} (Live)</h3>
                <table>
                <thead>
                <tr>
                    <th>Team No</th>
                    <th>Team Name</th>
                    <th>Bid</th>
                </tr>
                </thead>
                <tbody>`;

            let teamNo = 1;

            for (let team in data.teams) {

                let bid =
                    data.currentRoundBids[team] || 0;

                html += `
                <tr>
                    <td>${teamNo}</td>
                    <td>${team}</td>
                    <td>₹${bid}</td>
                </tr>`;

                teamNo++;
            }

            html += "</tbody></table></div>";

            roundDetailsContainer.innerHTML = html;

        } else {

            data.roundDetails.forEach(r => {

                let html = `<div class="round-card">
                <h3>Round ${r.round}</h3>
                <table>
                <thead>
                <tr>
                    <th>Team No</th>
                    <th>Team Name</th>
                    <th>Bid</th>
                </tr>
                </thead>
                <tbody>`;

                r.bids.forEach(b => {
                    html += `
                    <tr>
                        <td>${b.teamNo}</td>
                        <td>${b.team}</td>
                        <td>₹${b.bid}</td>
                    </tr>`;
                });

                html += "</tbody></table></div>";

                roundDetailsContainer.innerHTML += html;
            });
        }
    }

    updateLayout();
}

setInterval(loadData, 1000);
loadData();
updateLayout();
