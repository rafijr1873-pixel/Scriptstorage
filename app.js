import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLiExnF0JvhoB3rkgUPt6Gr-QA-44lNyc",
  authDomain: "lalamm-1f97c.firebaseapp.com",
  projectId: "lalamm-1f97c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const scriptsRef = collection(db, "scripts");

const appDiv = document.getElementById("app");

// ✅ Router Clean URL
const path = window.location.pathname;

if (path.startsWith("/raw/")) {
  loadRaw(path.split("/raw/")[1]);
} else {
  loadHome();
}

async function loadRaw(id) {
  document.body.innerHTML = "";
  const docRef = doc(db, "scripts", id);
  const snap = await getDoc(docRef);

  document.body.style.background = "white";
  document.body.style.color = "black";
  document.body.style.fontFamily = "monospace";
  document.body.style.padding = "20px";

  if (snap.exists()) {
    document.body.innerText = snap.data().code;
  } else {
    document.body.innerText = "Script not found.";
  }
}

async function loadHome() {
  appDiv.innerHTML = `
    <h2>Add Script</h2>
    <input id="title" placeholder="Title">
    <textarea id="code" placeholder="Lua script"></textarea>
    <button onclick="saveScript()">Publish</button>

    <h2>Search</h2>
    <input id="search" onkeyup="searchScript()" placeholder="Search...">

    <div id="list"></div>
  `;

  loadScripts();
}

window.saveScript = async function() {
  const title = document.getElementById("title").value;
  const code = document.getElementById("code").value;
  const docRef = await addDoc(scriptsRef, { title, code });
  location.reload();
}

async function loadScripts() {
  const snapshot = await getDocs(scriptsRef);
  const list = document.getElementById("list");
  list.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    list.innerHTML += `
      <div class="script-box">
        <h3>${data.title}</h3>

        <button onclick="window.open('/raw/${docSnap.id}')">Raw</button>
        <button onclick="copyCode(\`${data.code}\`)">Copy</button>
        <button onclick="downloadLua(\`${data.code}\`, '${data.title}')">Download</button>

        <pre><code class="language-lua">${data.code}</code></pre>
      </div>
    `;
  });

  hljs.highlightAll();
}

window.copyCode = function(code){
  navigator.clipboard.writeText(code);
  alert("Copied!");
}

window.downloadLua = function(code, title){
  const blob = new Blob([code], {type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = title + ".lua";
  a.click();
}

window.searchScript = function(){
  const input = document.getElementById("search").value.toLowerCase();
  document.querySelectorAll(".script-box").forEach(box=>{
    box.style.display = box.innerText.toLowerCase().includes(input) ? "block":"none";
  });
}

window.toggleMenu = function(){
  const menu = document.getElementById("menu");
  menu.style.display = menu.style.display === "flex" ? "none":"flex";
}
