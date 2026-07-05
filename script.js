// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, set } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase config 
const firebaseConfig = {
  apiKey: "AIzaSyBQXUWiNvKB22UDmsq356H6ZUpFFWgo_KM",
  authDomain: "smart-problem-reporter.firebaseapp.com",
  projectId: "smart-problem-reporter",
  storageBucket: "smart-problem-reporter.appspot.com",
  messagingSenderId: "863665385748",
  appId: "1:863665385748:web:ea1bae3d83273400bdd201",
  databaseURL: "https://smart-problem-reporter-default-rtdb.firebaseio.com/" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM elements
let form = document.getElementById("form");
let list = document.getElementById("list");
let locationData = "";

// 📡 GET LOCATION (CITY NAME)
window.getLocation = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {

      let lat = pos.coords.latitude;
      let lon = pos.coords.longitude;

      try {
        let url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

        let res = await fetch(url);
        let data = await res.json();

        let city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.state ||
          "Unknown location";

        locationData = city;

        document.getElementById("locationText").innerText =
          "📡 " + city;

      } catch (err) {
        alert("Location fetch error ⚠️");
        console.log(err);
      }

    }, () => {
      alert("Location allow karo ⚠️");
    });
  } else {
    alert("Browser location support nahi karta");
  }
};

// 📝 SUBMIT DATA TO FIREBASE
form.addEventListener("submit", function (e) {
  e.preventDefault();

  let title = document.getElementById("title").value;
  let desc = document.getElementById("desc").value;

  if (!title) {
    alert("Title zaroor bharo ⚠️");
    return;
  }

  let problem = {
    title: title,
    desc: desc,
    location: locationData,
    status: "Submit Problem"
  };

  push(ref(db, "problems"), problem);

  form.reset();
  locationData = "";
  document.getElementById("locationText").innerText = "";
});

// 🔄 LIVE DATA SHOW
onValue(ref(db, "problems"), (snapshot) => {
  list.innerHTML = "";

  if (!snapshot.exists()) {
    list.innerHTML = "<p>No problems reported 🚫</p>";
    return;
  }

  snapshot.forEach((child) => {
    let p = child.val();

    list.innerHTML += `
      <div class="card">
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <p>📡 ${p.location || "No location"}</p>
        <div class="status">${p.status}</div>
      </div>
    `;
  });
});

// 🧹 CLEAR ALL PROBLEMS
window.clearProblems = function () {
  let confirmClear = confirm("Sab problems delete karne hai?");

  if (confirmClear) {
    set(ref(db, "problems"), null);
    list.innerHTML = "";
    alert("All problems cleared ✔");
  }
};