/* ============================
   LOGIN (dummy)
=============================== */
document.getElementById("loginBtn").onclick = () => {
    document.getElementById("loginWrap").style.display = "none";
    document.getElementById("appUI").style.display = "block";

    // Ensure map redraw when entering Map
    setTimeout(() => {
        if (window.mainMap) mainMap.invalidateSize();
        if (window.smallMap) smallMap.invalidateSize();
    }, 300);
};


/* ============================
   NAVIGATION (TAB SWITCHING)
=============================== */
const navBtns = document.querySelectorAll("#mainNav button");
const sections = document.querySelectorAll("main section");

navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        navBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        sections.forEach(sec => sec.style.display = "none");
        document.getElementById(btn.dataset.target).style.display = "block";

        // Fix Leaflet map render on tab switch
        setTimeout(() => {
            if (window.mainMap) mainMap.invalidateSize();
            if (window.smallMap) smallMap.invalidateSize();
        }, 300);
    });
});


/* ============================
   MAIN MAP
=============================== */
let mainMap = L.map("mapArea").setView([8.35, 124.88], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
}).addTo(mainMap);


/* ============================
   RECORDS MAP (SMALL MAP)
=============================== */
let smallMap = L.map("smallMap").setView([8.35, 124.88], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
}).addTo(smallMap);

let smallMarker = null;

smallMap.on("click", function (e) {
    let lat = e.latlng.lat.toFixed(6);
    let lng = e.latlng.lng.toFixed(6);

    document.getElementById("smallCoords").innerHTML =
        `Lat: <b>${lat}</b> | Lng: <b>${lng}</b>`;

    if (smallMarker) smallMap.removeLayer(smallMarker);
    smallMarker = L.marker([lat, lng]).addTo(smallMap);
});


/* ============================
   WEATHER API (sample)
=============================== */
document.getElementById("getWeatherBtn").onclick = async () => {
    let city = document.getElementById("city").value;

    if (!city) return;

    document.getElementById("forecast").innerHTML = "<p>Loading...</p>";

    try {
        const res = await fetch(`https://wttr.in/${city}?format=3`);
        const text = await res.text();
        document.getElementById("forecast").innerHTML = text;
    } catch {
        document.getElementById("forecast").innerHTML = "Error loading weather";
    }
};


/* ============================
   RECORDS CRUD
=============================== */
let records = [];
const crop = document.getElementById("crop");
const qty = document.getElementById("qty");
const unit = document.getElementById("unit");
const addBtn = document.getElementById("addRec");
const list = document.getElementById("list");

[crop, qty].forEach(el => {
    el.addEventListener("input", () => {
        addBtn.disabled = !(crop.value && qty.value);
    });
});


addBtn.onclick = () => {
    let row = {
        crop: crop.value,
        qty: qty.value,
        unit: unit.value
    };

    records.push(row);
    renderRecords();

    crop.value = "";
    qty.value = "";
    addBtn.disabled = true;
};


function renderRecords() {
    list.innerHTML = "";

    records.forEach((r, i) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.crop}</td>
            <td>${r.qty}</td>
            <td>${r.unit}</td>
            <td>-</td>
            <td>-</td>
            <td><button class="btn" onclick="deleteRecord(${i})">Delete</button></td>
        `;
        list.appendChild(tr);
    });
}

function deleteRecord(i) {
    records.splice(i, 1);
    renderRecords();
}
