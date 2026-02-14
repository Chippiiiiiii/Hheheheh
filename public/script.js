let savedTeam = localStorage.getItem("teamName");

// LOGOUT (Change Team)
function logout() {
    localStorage.removeItem("teamName");
    location.reload();
}

// REGISTER
async function register() {

    const input = document.getElementById("teamName");
    const teamName = input.value.trim();

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

    updateTeamTitle();
}

// UPDATE TEAM TITLE
function updateTeamTitle() {
    const title = document.getElementById("teamTitle");
    if (savedTeam) {
        title.innerText = savedTeam;
    } else {
        title.innerText = "Not Registered";
    }
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

// LOAD DATA
async function loadData() {

    const res = await fetch("/data");
    const data = await res.json();

    // If saved team does not exist anymore → clear it
    if (savedTeam && !data.teams[savedTeam]) {
        localStorage.removeItem("teamName");
        savedTeam = null;
    }

    updateTeamTitle();

    // Show correct cards
    if (savedTeam) {
        document.getElementById("registerCard").style.display = "none";
        document.getElementById("bidCard").style.display = "block";
    } else {
        document.getElementById("registerCard").style.display = "block";
        document.getElementById("bidCard").style.display = "none";
    }

    // TEAM INFO
    if (savedTeam && data.teams[savedTeam]) {
        document.getElementById("teamInfo").innerHTML = `
            <div class="team-box">
                <p>Capital: ₹${data.teams[savedTeam].capital}</p>
                <p>Your Current Bid: ₹${data.teams[savedTeam].bid}</p>
            </div>
        `;
    }

    // WINNER TABLE
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

setInterval(loadData, 1000);
