// -----------------------
//   Firebase IMPORTS
// -----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { 
    getAuth, GoogleAuthProvider, signInWithPopup, signOut 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
    getFirestore, doc, setDoc, getDoc, updateDoc,
    onSnapshot, addDoc, collection, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// -----------------------
//   Firebase CONFIG (YOURS)
// -----------------------
const firebaseConfig = {
    apiKey: "AIzaSyAEWxTJ1loQkXM1ShwAAF1J15RQLlCgdGM",
    authDomain: "msgapp-262c9.firebaseapp.com",
    projectId: "msgapp-262c9",
    storageBucket: "msgapp-262c9.firebasestorage.app",
    messagingSenderId: "122648836940",
    appId: "1:122648836940:web:a098c052f65f3eb305ade9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// -----------------------
//   UI ELEMENTS
// -----------------------
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app");
const userNameLabel = document.getElementById("userName");

const createRoomBtn = document.getElementById("createRoom");
const roomLinkBox = document.getElementById("roomLinkBox");
const roomLinkInput = document.getElementById("roomLink");
const copyLinkBtn = document.getElementById("copyLink");
const copiedMsg = document.getElementById("copiedMsg");

const chatSection = document.getElementById("chat-section");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// -----------------------
//   GLOBAL STATE
// -----------------------
let currentUser = null;
let currentRoomId = null;

// -----------------------
//   AUTH
// -----------------------
document.getElementById("googleLogin").onclick = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        currentUser = result.user;
        userNameLabel.textContent = currentUser.displayName;

        authSection.classList.add("hidden");
        appSection.classList.remove("hidden");

        checkIfOpeningRoom();
    } catch (e) {
        console.log(e);
        alert("Login failed");
    }
};

document.getElementById("logoutBtn").onclick = async () => {
    await signOut(auth);
    location.reload();
};

// -----------------------
//   CREATE ROOM
// -----------------------
createRoomBtn.onclick = async () => {
    const roomRef = doc(collection(db, "rooms"));
    await setDoc(roomRef, {
        owner: currentUser.uid,
        claimed: false,
        createdAt: serverTimestamp()
    });

    const link = ${window.location.origin}?room=${roomRef.id};
    roomLinkInput.value = link;

    roomLinkBox.classList.remove("hidden");
};

// -----------------------
//   COPY ROOM LINK
// -----------------------
copyLinkBtn.onclick = () => {
    navigator.clipboard.writeText(roomLinkInput.value);
    copiedMsg.classList.remove("hidden");
    setTimeout(() => copiedMsg.classList.add("hidden"), 1000);
};

// -----------------------
//   JOIN ROOM FROM LINK
// -----------------------
async function checkIfOpeningRoom() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("room");

    if (!roomId) return;

    currentRoomId = roomId;

    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        alert("Room does not exist.");
        return;
    }

    const room = roomSnap.data();

    if (room.claimed === true && room.other !== currentUser.uid) {
        alert("Room already claimed by someone else.");
        return;
    }

    // claim room if not claimed
    if (!room.claimed) {
        await updateDoc(roomRef, {
            claimed: true,
            other: currentUser.uid
        });
    }

    startChat(roomId);
}

// -----------------------
//   REAL-TIME CHAT
// -----------------------
function startChat(roomId) {
    chatSection.classList.remove("hidden");

    const msgRef = collection(db, "rooms", roomId, "messages");

    // listen to messages live
    onSnapshot(msgRef, (snapshot) => {
        messagesDiv.innerHTML = "";
        snapshot.forEach((doc) => {
            const msg = doc.data();
            const div = document.createElement("div");
            div.classList.add("message");

            if (msg.sender === currentUser.uid) {
                div.classList.add("mine");
            } else {
                div.classList.add("theirs");
            }

            div.innerText = msg.text;
            messagesDiv.appendChild(div);
        });

        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    // send message
    sendBtn.onclick = async () => {
        const text = messageInput.value.trim();
        if (text === "") return;

        await addDoc(msgRef, {
            sender: currentUser.uid,
            text: text,
            time: serverTimestamp()
        });

        messageInput.value = "";
    };
}