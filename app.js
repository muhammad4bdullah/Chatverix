// ------------------------ IMPORTS ------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getDatabase, ref, set, push, onValue, get, remove, update 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ------------------------ FIREBASE INIT ------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAEWxTJ1loQkXM1ShwAAF1J15RQLlCgdGM",
  authDomain: "msgapp-262c9.firebaseapp.com",
  projectId: "msgapp-262c9",
  storageBucket: "msgapp-262c9.appspot.com",
  messagingSenderId: "122648836940",
  appId: "1:122648836940:web:a098c052f65f3eb305ade9",
  databaseURL: "https://msgapp-262c9-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// ------------------------ GLOBALS ------------------------
let currentUser = null;
let activeRoom = null;
const DEFAULT_AVATAR = "https://i.ibb.co/7QpKsCX/default-avatar.png";

// ------------------------ UI ELEMENTS ------------------------
const loginScreen = document.getElementById("login-screen");
const mainScreen = document.getElementById("main");

const googleLoginBtn = document.getElementById("googleLogin");
const btnLogout = document.getElementById("btnLogout");

const userPhoto = document.getElementById("userPhoto");
const userNameDisplay = document.getElementById("userNameDisplay");
const userEmail = document.getElementById("userEmail");

const btnShowCreate = document.getElementById("btnShowCreate");
const btnShowJoin = document.getElementById("btnShowJoin");

const createRoomSection = document.getElementById("createRoomSection");
const joinRoomSection = document.getElementById("joinRoomSection");

const roomNameCreate = document.getElementById("roomNameCreate");
const roomPASScreate = document.getElementById("roomPASScreate");
const btnCreate = document.getElementById("btnCreate");

const roomIDjoin = document.getElementById("roomIDjoin");
const roomPASSjoin = document.getElementById("roomPASSjoin");
const btnJoin = document.getElementById("btnJoin");

const roomListEl = document.getElementById("roomList");
const noRooms = document.getElementById("noRooms");

const chatHeader = document.getElementById("chatHeader");
const messagesEl = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendMsg = document.getElementById("sendMsg");

const roomInfoEl = document.getElementById("roomInfo");

const profileModal = document.getElementById("profileModal");
const modalPhoto = document.getElementById("modalPhoto");
const modalNickname = document.getElementById("modalNickname");
const modalDOB = document.getElementById("modalDOB");
const modalSaveProfile = document.getElementById("modalSaveProfile");
const modalClose = document.getElementById("modalClose");

// ------------------------ LOGIN HANDLERS ------------------------
googleLoginBtn.onclick = () => signInWithPopup(auth, provider);
btnLogout.onclick = () => signOut(auth);

// ------------------------ AUTH STATE CHANGE ------------------------
onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;
    loginScreen.style.display = "none";
    mainScreen.style.display = "block";

    await loadUserProfile(user.uid);
    loadRooms();
  } else {
    currentUser = null;
    loginScreen.style.display = "block";
    mainScreen.style.display = "none";
    clearUI();
  }
});

// ------------------------ LOAD USER PROFILE ------------------------
async function loadUserProfile(uid) {
  const snap = await get(ref(db, `users/${uid}`));
  const data = snap.exists() ? snap.val() : {};

  const nickname = data.displayName || currentUser.displayName || "User";
  const photoURL = data.photoURL || currentUser.photoURL || DEFAULT_AVATAR;

  userPhoto.src = photoURL;
  userNameDisplay.innerText = nickname;
  userEmail.innerText = currentUser.email;

  await update(ref(db, `users/${uid}`), {
    uid,
    displayName: nickname,
    photoURL,
    email: currentUser.email,
    lastLogin: Date.now()
  });
}

// ------------------------ CREATE & JOIN ROOM ------------------------
btnShowCreate.onclick = () => {
  createRoomSection.classList.toggle("hidden");
  joinRoomSection.classList.add("hidden");
};

btnShowJoin.onclick = () => {
  joinRoomSection.classList.toggle("hidden");
  createRoomSection.classList.add("hidden");
};

function randomRoomID() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

btnCreate.onclick = async () => {
  const pass = roomPASScreate.value.trim();
  if (!/^\d{6}$/.test(pass)) return alert("Password must be 6 digits");

  const id = randomRoomID();
  const chatName = roomNameCreate.value.trim() || id;
  const roomURL = `${location.origin}${location.pathname}?room=${id}`;

  await set(ref(db, `rooms/${id}`), {
    pass,
    chatName,
    roomURL,
    createdBy: currentUser.uid,
    createdAt: Date.now()
  });
  await set(ref(db, `members/${id}/${currentUser.uid}`), true);

  loadRooms();
  openRoom(id);
  updateRoomInfo(id, pass, chatName, roomURL);
};

btnJoin.onclick = async () => {
  const id = roomIDjoin.value.trim().toUpperCase();
  const pass = roomPASSjoin.value.trim();

  const snap = await get(ref(db, `rooms/${id}`));
  if (!snap.exists()) return alert("Room not found");
  if (snap.val().pass !== pass) return alert("Wrong password");

  await set(ref(db, `members/${id}/${currentUser.uid}`), true);

  openRoom(id);
  updateRoomInfo(id, pass, snap.val().chatName, snap.val().roomURL);
};

// ------------------------ ROOM INFO ------------------------
function updateRoomInfo(id, pass, name, url) {
  roomInfoEl.innerHTML = `
    <div><b>Name:</b> ${name}</div>
    <div><b>ID:</b> ${id}</div>
    <div><b>Password:</b> ${pass}</div>
    <div><b>URL:</b> 
      <input value="${url}" readonly style="width:200px;">
      <button onclick="copyRoomLink()">Copy</button>
    </div>`;
}

window.copyRoomLink = () => {
  const box = roomInfoEl.querySelector("input");
  if (box) navigator.clipboard.writeText(box.value).then(() => alert("Copied!"));
};

// ------------------------ ROOM LIST ------------------------
function loadRooms() {
  onValue(ref(db, "members"), snap => {
    roomListEl.innerHTML = "";
    let found = false;

    snap.forEach(roomSnap => {
      if (roomSnap.child(currentUser.uid).exists()) {
        found = true;
        const id = roomSnap.key;

        const row = document.createElement("div");
        row.className = "room-row";

        const btn = document.createElement("button");
        btn.textContent = id;
        btn.onclick = () => openRoom(id);

        const dots = document.createElement("span");
        dots.innerHTML = "⋮";
        dots.className = "room-dots";
        dots.style.marginLeft = "12px";
        dots.style.zIndex = "9999";
        dots.style.cursor = "pointer";

        dots.onclick = e => {
          e.stopPropagation();
          showRoomMenu(e, id);
        };

        row.appendChild(btn);
        row.appendChild(dots);
        roomListEl.appendChild(row);
      }
    });

    noRooms.classList.toggle("hidden", found);
  });
}

// ------------------------ THREE DOTS MENU ------------------------
function showRoomMenu(e, roomID) {
  const old = document.getElementById("roomMenu");
  if (old) old.remove();

  const menu = document.createElement("div");
  menu.id = "roomMenu";
  menu.className = "room-menu";
  menu.style.position = "fixed";
  menu.style.top = e.clientY + "px";
  menu.style.left = e.clientX + "px";
  menu.style.zIndex = "50000";

  menu.innerHTML = `
    <div onclick="renameRoom('${roomID}')">Rename</div>
    <div onclick="deleteRoom('${roomID}')">Delete</div>
  `;

  document.body.appendChild(menu);

  setTimeout(() => {
    document.addEventListener("click", () => {
      menu.remove();
    }, { once: true });
  }, 50);
}

// ------------------------ RENAME ROOM ------------------------
window.renameRoom = async (roomID) => {
  const snap = await get(ref(db, `rooms/${roomID}`));
  if (!snap.exists()) return;

  const currentName = snap.val().chatName;
  const newName = prompt("Enter new chat name:", currentName);

  if (!newName || newName.trim() === "") return;

  await update(ref(db, `rooms/${roomID}`), { chatName: newName.trim() });

  if (activeRoom === roomID) chatHeader.innerText = newName;

  loadRooms();
};

// ------------------------ DELETE ROOM ------------------------
window.deleteRoom = async (roomID) => {
  if (!confirm("Are you sure you want to delete this room?")) return;

  await remove(ref(db, `rooms/${roomID}`));
  await remove(ref(db, `members/${roomID}`));
  await remove(ref(db, `messages/${roomID}`));

  if (activeRoom === roomID) {
    activeRoom = null;
    chatHeader.innerText = "No Room";
    messagesEl.innerHTML = `<div class="center muted">Select a room</div>`;
  }

  loadRooms();
};

// ------------------------ OPEN ROOM ------------------------
window.openRoom = async function(roomID) {
  activeRoom = roomID;

  const snap = await get(ref(db, `rooms/${roomID}`));
  chatHeader.innerText = snap.exists() ? snap.val().chatName : roomID;

  listenMessages(roomID);
};

// ------------------------ LISTEN MESSAGES ------------------------
function listenMessages(roomID) {
  onValue(ref(db, `messages/${roomID}`), snap => {
    messagesEl.innerHTML = "";

    if (!snap.exists()) {
      messagesEl.innerHTML = `<div class="center muted">No messages</div>`;
      return;
    }

    snap.forEach(m => {
      const d = m.val();

      const wrap = document.createElement("div");
      wrap.className = "message " + (d.uid === currentUser.uid ? "mine" : "");

      const img = document.createElement("img");
      img.src = d.photoURL || DEFAULT_AVATAR;
      img.className = "msg-avatar";

      const bubble = document.createElement("div");
      bubble.className = "bubble";

      const name = document.createElement("div");
      name.className = "msg-name";
      name.textContent = d.nickname;

      const txt = document.createElement("div");
      txt.textContent = d.text;

      const time = document.createElement("div");
      time.className = "msg-time";
      time.textContent = new Date(d.time).toLocaleTimeString();

      bubble.appendChild(name);
      bubble.appendChild(txt);
      bubble.appendChild(time);

      wrap.appendChild(img);
      wrap.appendChild(bubble);

      messagesEl.appendChild(wrap);
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

// ------------------------ SEND MESSAGE ------------------------
sendMsg.onclick = sendMessage;
msgInput.onkeydown = e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

function sendMessage() {
  if (!currentUser || !activeRoom) return;
  const text = msgInput.value.trim();
  if (!text) return;
  msgInput.value = "";

  push(ref(db, `messages/${activeRoom}`), {
    uid: currentUser.uid,
    nickname: userNameDisplay.innerText,
    photoURL: userPhoto.src,
    text,
    time: Date.now()
  });
}

// ------------------------ CLEAR UI ------------------------
function clearUI() {
  messagesEl.innerHTML = `<div class="center muted">Select a room</div>`;
  chatHeader.innerText = "No Room";
  roomListEl.innerHTML = "";
  roomInfoEl.innerHTML = "";
}

// ------------------------ PROFILE MODAL ------------------------
// Already handled above (avatar, nickname, DOB)
modalClose.onclick = () => profileModal.classList.remove("show");

modalSaveProfile.onclick = async () => {
  if (!currentUser) return;

  const snap = await get(ref(db, `users/${currentUser.uid}`));
  const data = snap.exists() ? snap.val() : {};
  const now = Date.now();
  const lastChange = data.lastUsernameChange || 0;
  const diff = now - lastChange;

  if (modalNickname.value !== data.displayName && diff < 14 * 24 * 60 * 60 * 1000) {
    alert("You can change username only once every 14 days.");
    return;
  }

  await update(ref(db, `users/${currentUser.uid}`), {
    photoURL: modalPhoto.src,
    displayName: modalNickname.value,
    dob: modalDOB.value,
    lastUsernameChange: (modalNickname.value !== data.displayName) ? now : lastChange
  });

  userPhoto.src = modalPhoto.src;
  userNameDisplay.innerText = modalNickname.value;

  profileModal.classList.remove("show");
  alert("Profile updated!");
};
