// =========================================================
// CHATVERIX
// Firebase + Real-time Messenger
// =========================================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getAuth,
  signOut,
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  get,
  remove,
  update,
  onDisconnect,
  serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";


// =========================================================
// FIREBASE
// =========================================================

const firebaseConfig = {
  apiKey: "AIzaSyAEWxTJ1loQkXM1ShwAAF1J15RQLlCgdGM",
  authDomain: "msgapp-262c9.firebaseapp.com",
  projectId: "msgapp-262c9",
  storageBucket: "msgapp-262c9.appspot.com",
  messagingSenderId: "122648836940",
  appId: "1:122648836940:web:a098c052f65f3eb305ade9",
  databaseURL:
    "https://msgapp-262c9-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


// =========================================================
// CONSTANTS
// =========================================================

const DEFAULT_AVATAR =
  "https://i.ibb.co/7QpKsCX/default-avatar.png";

const MAX_ROOM_AGE =
  24 * 60 * 60 * 1000;

const REACTIONS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢"
];


// =========================================================
// GLOBAL STATE
// =========================================================

let currentUser = null;

let activeRoom =
  localStorage.getItem("activeRoom") || null;

let activeRoomCreator = null;

let roomFilter = "all";

let usersCache = {};

let roomsListener = null;

let messagesListener = null;

let typingListener = null;

let usersPanelUnsub = null;

let typingTimeout = null;

let myStatusRef = null;

let currentReply = null;

let openMenu = null;

let roomInfoOpen = false;

let mobileRoomsOpen = false;

let statusUnsubscribers = {};


// =========================================================
// ELEMENTS
// =========================================================

const mainScreen =
  document.getElementById("main");

const sidebar =
  document.getElementById("sidebar");

const chat =
  document.getElementById("chat");

const chatContent =
  document.getElementById("chatContent");

const emptyChatState =
  document.getElementById("emptyChatState");

const btnLogout =
  document.getElementById("btnLogout");

const userPhoto =
  document.getElementById("userPhoto");

const userNameDisplay =
  document.getElementById("userNameDisplay");

const userEmail =
  document.getElementById("userEmail");

const myStatusDot =
  document.getElementById("userStatus");

const profileTrigger =
  document.getElementById("profileTrigger");


const btnShowCreate =
  document.getElementById("btnShowCreate");

const btnShowJoin =
  document.getElementById("btnShowJoin");

const createRoomSection =
  document.getElementById("createRoomSection");

const joinRoomSection =
  document.getElementById("joinRoomSection");

const roomNameCreate =
  document.getElementById("roomNameCreate");

const roomPASScreate =
  document.getElementById("roomPASScreate");

const btnCreate =
  document.getElementById("btnCreate");

const roomIDjoin =
  document.getElementById("roomIDjoin");

const roomPASSjoin =
  document.getElementById("roomPASSjoin");

const btnJoin =
  document.getElementById("btnJoin");

const roomListEl =
  document.getElementById("roomList");

const noRooms =
  document.getElementById("noRooms");

const roomCount =
  document.getElementById("roomCount");

const roomSearchInput =
  document.getElementById("roomSearchInput");

const clearRoomSearch =
  document.getElementById("clearRoomSearch");


const chatHeader =
  document.getElementById("chatHeader");

const chatRoomInitial =
  document.getElementById("chatRoomInitial");

const chatRoomStatus =
  document.getElementById("chatRoomStatus");

const messagesEl =
  document.getElementById("messages");

const msgInput =
  document.getElementById("msgInput");

const sendMsg =
  document.getElementById("sendMsg");

const replyBar =
  document.getElementById("replyBar");

const typingIndicator =
  document.getElementById("typingIndicator");


const roomInfoWrapper =
  document.getElementById("roomInfoWrapper");

const roomInfoToggle =
  document.getElementById("roomInfoToggle");

const roomInfoName =
  document.getElementById("roomInfoName");

const roomInfoID =
  document.getElementById("roomInfoID");

const roomInfoPassword =
  document.getElementById("roomInfoPassword");

const roomInfoURL =
  document.getElementById("roomInfoURL");

const copyRoomLinkBtn =
  document.getElementById("copyRoomLinkBtn");


const filterAllBtn =
  document.getElementById("filterAll");

const filterCreatedBtn =
  document.getElementById("filterCreated");

const filterJoinedBtn =
  document.getElementById("filterJoined");


const profileModal =
  document.getElementById("profileModal");

const modalPhoto =
  document.getElementById("modalPhoto");

const modalNickname =
  document.getElementById("modalNickname");

const modalDOB =
  document.getElementById("modalDOB");

const modalSaveProfile =
  document.getElementById("modalSaveProfile");

const modalClose =
  document.getElementById("modalClose");

const modalUsername =
  document.getElementById("modalUsername");

const modalHeading =
  document.getElementById("modalHeading");

const modalInstructions =
  document.getElementById("modalInstructions");

const modalStatus =
  document.getElementById("modalStatus");

const modalStatusText =
  document.getElementById("modalStatusText");

const changeAvatarButton =
  document.getElementById("changeAvatarButton");

const avatarInput =
  document.getElementById("avatarInput");


const imageViewer =
  document.getElementById("imageViewer");

const imageViewerImg =
  document.getElementById("imageViewerImg");

const imageViewerClose =
  document.getElementById("imageViewerClose");

const imageViewerDownload =
  document.getElementById("imageViewerDownload");


const usersPanelBtn =
  document.getElementById("usersPanelBtn");

const usersPanelMenu =
  document.getElementById("usersPanelMenu");

const closeUsersPanel =
  document.getElementById("closeUsersPanel");

const liveUsersList =
  document.getElementById("liveUsersList");


const seenOverlay =
  document.getElementById("seenOverlay");

const seenList =
  document.getElementById("seenList");


const toastContainer =
  document.getElementById("toastContainer");

const attachmentBtn =
  document.getElementById("attachmentBtn");

const attachmentMenu =
  document.getElementById("attachmentMenu");

const imageBtn =
  document.getElementById("imageBtn");

const documentBtn =
  document.getElementById("documentBtn");

const linkBtn =
  document.getElementById("linkBtn");

const mobileRoomsBtn =
  document.getElementById("mobileRoomsBtn");


// =========================================================
// TOAST
// =========================================================

function toast(message, type = "") {

  const item =
    document.createElement("div");

  item.className =
    `toast ${type}`;

  item.textContent =
    message;

  toastContainer.appendChild(item);

  setTimeout(() => {

    item.classList.add("out");

    setTimeout(() => {
      item.remove();
    }, 220);

  }, 2800);
}


// =========================================================
// SAFE TEXT
// =========================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// =========================================================
// STATUS
// =========================================================

function updateStatusDot(dotEl, state) {

  if (!dotEl) return;

  dotEl.classList.remove(
    "online",
    "offline"
  );

  dotEl.classList.add(
    state === "online"
      ? "online"
      : "offline"
  );
}


function updateModalStatus(state) {

  updateStatusDot(
    modalStatus,
    state
  );

  modalStatusText.textContent =
    state === "online"
      ? "Online"
      : "Offline";
}


async function setUserOnline(uid) {

  myStatusRef =
    ref(db, `status/${uid}`);

  await set(myStatusRef, {
    state: "online",
    lastChanged: serverTimestamp()
  });

  await onDisconnect(myStatusRef)
    .set({
      state: "offline",
      lastChanged: serverTimestamp()
    });

  updateStatusDot(
    myStatusDot,
    "online"
  );
}


// =========================================================
// AUTH
// =========================================================

onAuthStateChanged(
  auth,
  async user => {

    if (!user) {
      window.location.href =
        "login.html";
      return;
    }

    currentUser = user;

    mainScreen.style.display =
      "flex";

    try {

      await setUserOnline(
        user.uid
      );

      await loadUserProfile(
        user.uid
      );

      await cleanupOldRooms();

      loadRooms();

      checkRoomLink();

      if (activeRoom) {

        const roomSnap =
          await get(
            ref(
              db,
              `rooms/${activeRoom}`
            )
          );

        const memberSnap =
          await get(
            ref(
              db,
              `members/${activeRoom}/${user.uid}`
            )
          );

        if (
          roomSnap.exists() &&
          memberSnap.exists()
        ) {

          await openRoom(
            activeRoom
          );

        } else {

          activeRoom = null;

          localStorage.removeItem(
            "activeRoom"
          );

        }

      }

    } catch (error) {

      console.error(error);

      toast(
        "Something went wrong while loading Chatverix.",
        "error"
      );
    }

  }
);


// =========================================================
// LOGOUT
// =========================================================

btnLogout.onclick =
  async () => {

    try {

      if (myStatusRef) {

        await set(
          myStatusRef,
          {
            state: "offline",
            lastChanged: serverTimestamp()
          }
        );

      }

      await signOut(auth);

      window.location.href =
        "login.html";

    } catch (error) {

      console.error(error);

      toast(
        "Could not log out.",
        "error"
      );

    }

  };


// =========================================================
// PROFILE
// =========================================================

profileTrigger.onclick =
  () => {

    if (currentUser) {

      openProfileModal(
        currentUser.uid,
        true
      );

    }

  };


async function loadUserProfile(uid) {

  const userRef =
    ref(db, `users/${uid}`);

  const snap =
    await get(userRef);

  let data;

  if (!snap.exists()) {

    data = {

      username:
        `user${uid.slice(0, 6)}`,

      nickname:
        "User",

      photoURL:
        DEFAULT_AVATAR,

      dob:
        "",

      createdAt:
        Date.now(),

      lastLogin:
        Date.now(),

      lastUsernameChange:
        0,

      lastNicknameChange:
        0
    };

    await set(
      ref(
        db,
        `usernames/${data.username}`
      ),
      uid
    );

    await set(
      userRef,
      data
    );

  } else {

    data = snap.val();

    await update(
      userRef,
      {
        lastLogin:
          Date.now()
      }
    );

  }

  usersCache[uid] =
    data;

  userPhoto.src =
    data.photoURL ||
    DEFAULT_AVATAR;

  userNameDisplay.textContent =
    data.nickname ||
    "User";

  userEmail.textContent =
    data.email ||
    currentUser.email ||
    "";
}


// =========================================================
// PROFILE MODAL
// =========================================================

async function openProfileModal(
  uid,
  editable
) {

  let data =
    usersCache[uid];

  if (!data) {

    const snap =
      await get(
        ref(
          db,
          `users/${uid}`
        )
      );

    data =
      snap.exists()
        ? snap.val()
        : {
            nickname: "User",
            username: "user",
            photoURL: DEFAULT_AVATAR,
            dob: ""
          };

    usersCache[uid] =
      data;
  }

  modalPhoto.src =
    data.photoURL ||
    DEFAULT_AVATAR;

  modalUsername.value =
    data.username ||
    `user${uid.slice(0, 6)}`;

  modalNickname.value =
    data.nickname ||
    "User";

  modalDOB.value =
    data.dob ||
    "";

  modalHeading.textContent =
    editable
      ? "Edit Profile"
      : "Profile";

  modalUsername.disabled =
    !editable;

  modalNickname.disabled =
    !editable;

  modalDOB.disabled =
    !editable;

  modalSaveProfile.style.display =
    editable
      ? "block"
      : "none";

  modalInstructions.style.display =
    editable
      ? "block"
      : "none";

  changeAvatarButton.style.display =
    editable
      ? "grid"
      : "none";

  modalPhoto.style.cursor =
    editable
      ? "pointer"
      : "default";

  if (editable) {

    changeAvatarButton.onclick =
      () => avatarInput.click();

    modalPhoto.onclick =
      () => avatarInput.click();

  } else {

    changeAvatarButton.onclick =
      null;

    modalPhoto.onclick =
      null;

  }

  const statusRef =
    ref(
      db,
      `status/${uid}`
    );

  onValue(
    statusRef,
    snap => {

      const state =
        snap.exists()
          ? snap.val().state
          : "offline";

      updateModalStatus(
        state
      );

    }
  );

  profileModal.classList.add(
    "show"
  );
}


function closeProfileModal() {

  profileModal.classList.remove(
    "show"
  );

}


modalClose.onclick =
  closeProfileModal;

profileModal
  .querySelector(".modal-backdrop")
  .onclick =
  closeProfileModal;


document.addEventListener(
  "keydown",
  e => {

    if (
      e.key === "Escape"
    ) {

      closeProfileModal();

      closeImageViewer();

      closeSeenOverlay();

      closeAllMenus();

      attachmentMenu.classList.remove(
        "show"
      );

    }

  }
);


// =========================================================
// AVATAR
// =========================================================

avatarInput.onchange =
  () => {

    const file =
      avatarInput.files[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      toast(
        "Please choose an image.",
        "error"
      );

      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {

      toast(
        "Avatar must be under 2 MB.",
        "error"
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload =
      () => {

        modalPhoto.src =
          reader.result;

      };

    reader.readAsDataURL(
      file
    );

  };


modalSaveProfile.onclick =
  async () => {

    if (!currentUser) return;

    try {

      const userRef =
        ref(
          db,
          `users/${currentUser.uid}`
        );

      const snap =
        await get(userRef);

      const data =
        snap.exists()
          ? snap.val()
          : {};

      const now =
        Date.now();

      const newUsername =
        modalUsername.value
          .trim()
          .toLowerCase();

      const newNickname =
        modalNickname.value
          .trim();

      if (
        !/^[a-z0-9_]{3,16}$/
          .test(newUsername)
      ) {

        toast(
          "Username must be 3–16 characters.",
          "error"
        );

        return;
      }

      if (
        !newNickname
      ) {

        toast(
          "Nickname cannot be empty.",
          "error"
        );

        return;
      }

      if (
        newUsername !== data.username &&
        now -
          (data.lastUsernameChange || 0) <
          14 * 24 * 60 * 60 * 1000
      ) {

        toast(
          "Username can only be changed once every 14 days.",
          "error"
        );

        return;
      }

      if (
        newNickname !== data.nickname &&
        now -
          (data.lastNicknameChange || 0) <
          3 * 24 * 60 * 60 * 1000
      ) {

        toast(
          "Nickname can only be changed once every 3 days.",
          "error"
        );

        return;
      }

      const usernameRef =
        ref(
          db,
          `usernames/${newUsername}`
        );

      const usernameSnap =
        await get(
          usernameRef
        );

      if (
        usernameSnap.exists() &&
        usernameSnap.val() !==
          currentUser.uid
      ) {

        toast(
          "That username is already taken.",
          "error"
        );

        return;
      }

      if (
        data.username &&
        data.username !==
          newUsername
      ) {

        await remove(
          ref(
            db,
            `usernames/${data.username}`
          )
        );

      }

      await set(
        usernameRef,
        currentUser.uid
      );

      const updatedData = {

        ...data,

        username:
          newUsername,

        nickname:
          newNickname,

        displayName:
          newNickname,

        dob:
          modalDOB.value,

        photoURL:
          modalPhoto.src,

        lastUsernameChange:
          newUsername !== data.username
            ? now
            : data.lastUsernameChange || 0,

        lastNicknameChange:
          newNickname !== data.nickname
            ? now
            : data.lastNicknameChange || 0

      };

      await set(
        userRef,
        updatedData
      );

      usersCache[
        currentUser.uid
      ] =
        updatedData;

      userPhoto.src =
        updatedData.photoURL;

      userNameDisplay.textContent =
        newNickname;

      // Update current user's existing messages
      if (activeRoom) {

        const messagesSnap =
          await get(
            ref(
              db,
              `messages/${activeRoom}`
            )
          );

        if (messagesSnap.exists()) {

          const updates = {};

          messagesSnap.forEach(
            child => {

              const message =
                child.val();

              if (
                message.uid ===
                currentUser.uid
              ) {

                updates[
                  `messages/${activeRoom}/${child.key}/nickname`
                ] =
                  newNickname;

                updates[
                  `messages/${activeRoom}/${child.key}/photoURL`
                ] =
                  updatedData.photoURL;

              }

            }
          );

          if (
            Object.keys(updates).length
          ) {

            await update(
              ref(db),
              updates
            );

          }

        }

      }

      closeProfileModal();

      toast(
        "Profile updated successfully.",
        "success"
      );

    } catch (error) {

      console.error(error);

      toast(
        "Could not update profile.",
        "error"
      );

    }

  };


// =========================================================
// ROOM FORMS
// =========================================================

btnShowCreate.onclick =
  () => {

    createRoomSection.classList.toggle(
      "hidden"
    );

    joinRoomSection.classList.add(
      "hidden"
    );

  };


btnShowJoin.onclick =
  () => {

    joinRoomSection.classList.toggle(
      "hidden"
    );

    createRoomSection.classList.add(
      "hidden"
    );

  };


document
  .querySelectorAll(
    "[data-close-form]"
  )
  .forEach(button => {

    button.onclick =
      () => {

        const type =
          button.dataset.closeForm;

        if (
          type === "create"
        ) {

          createRoomSection.classList.add(
            "hidden"
          );

        }

        if (
          type === "join"
        ) {

          joinRoomSection.classList.add(
            "hidden"
          );

        }

      };

  });


// =========================================================
// ROOM ID
// =========================================================

function randomRoomID() {

  return Math.floor(
    10000000 +
    Math.random() *
    90000000
  ).toString();

}


// =========================================================
// CREATE ROOM
// =========================================================

btnCreate.onclick =
  async () => {

    if (!currentUser) return;

    const pass =
      roomPASScreate.value.trim();

    if (
      !/^[a-z0-9]{6,12}$/.test(pass)
    ) {

      toast(
        "Password must be 6–12 lowercase letters or digits.",
        "error"
      );

      return;
    }

    const chatName =
      roomNameCreate.value.trim() ||
      "New Room";

    const id =
      randomRoomID();

    const roomURL =
      `${location.origin}${location.pathname}?room=${id}&pass=${pass}`;

    try {

      await set(
        ref(
          db,
          `rooms/${id}`
        ),
        {
          pass,
          chatName,
          roomURL,
          createdBy:
            currentUser.uid,
          createdAt:
            Date.now()
        }
      );

      await set(
        ref(
          db,
          `members/${id}/${currentUser.uid}`
        ),
        true
      );

      await pushSystemMessage(
        id,
        `<strong>${escapeHTML(userNameDisplay.innerText)}</strong> created the room`
      );

      createRoomSection.classList.add(
        "hidden"
      );

      roomNameCreate.value =
        "";

      roomPASScreate.value =
        "";

      await openRoom(id);

      toast(
        "Room created successfully.",
        "success"
      );

    } catch (error) {

      console.error(error);

      toast(
        "Could not create room.",
        "error"
      );

    }

  };


// =========================================================
// JOIN ROOM
// =========================================================

btnJoin.onclick =
  async () => {

    const id =
      roomIDjoin.value.trim();

    const pass =
      roomPASSjoin.value.trim();

    if (
      !/^\d{8}$/.test(id)
    ) {

      toast(
        "Room ID must contain 8 digits.",
        "error"
      );

      return;
    }

    try {

      const snap =
        await get(
          ref(
            db,
            `rooms/${id}`
          )
        );

      if (!snap.exists()) {

        toast(
          "Room not found.",
          "error"
        );

        return;
      }

      const room =
        snap.val();

      if (
        room.pass !== pass
      ) {

        toast(
          "Wrong password.",
          "error"
        );

        return;
      }

      const kickedSnap =
        await get(
          ref(
            db,
            `kicked/${id}/${currentUser.uid}`
          )
        );

      if (
        kickedSnap.exists()
      ) {

        toast(
          "You are blocked from this room.",
          "error"
        );

        return;
      }

      const alreadyMember =
        await get(
          ref(
            db,
            `members/${id}/${currentUser.uid}`
          )
        );

      await set(
        ref(
          db,
          `members/${id}/${currentUser.uid}`
        ),
        true
      );

      if (
        !alreadyMember.exists()
      ) {

        await pushSystemMessage(
          id,
          `<strong>${escapeHTML(userNameDisplay.innerText)}</strong> joined the room`
        );

      }

      joinRoomSection.classList.add(
        "hidden"
      );

      roomIDjoin.value =
        "";

      roomPASSjoin.value =
        "";

      await openRoom(id);

      toast(
        "Joined room.",
        "success"
      );

    } catch (error) {

      console.error(error);

      toast(
        "Could not join room.",
        "error"
      );

    }

  };


// =========================================================
// ROOM LINK
// =========================================================

function checkRoomLink() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const roomID =
    params.get("room");

  const roomPASS =
    params.get("pass");

  if (roomID) {

    handleRoomLink(
      roomID,
      roomPASS
    );

  }

}


async function handleRoomLink(
  roomID,
  passFromURL
) {

  try {

    const snap =
      await get(
        ref(
          db,
          `rooms/${roomID}`
        )
      );

    if (!snap.exists()) {

      toast(
        "Room not found.",
        "error"
      );

      return;
    }

    const room =
      snap.val();

    let pass =
      passFromURL;

    if (!pass) {

      pass =
        prompt(
          "Enter room password:"
        );

    }

    if (!pass) return;

    if (
      room.pass !== pass
    ) {

      toast(
        "Wrong password.",
        "error"
      );

      return;
    }

    const kickedSnap =
      await get(
        ref(
          db,
          `kicked/${roomID}/${currentUser.uid}`
        )
      );

    if (
      kickedSnap.exists()
    ) {

      toast(
        "You are blocked from this room.",
        "error"
      );

      return;
    }

    const memberSnap =
      await get(
        ref(
          db,
          `members/${roomID}/${currentUser.uid}`
        )
      );

    await set(
      ref(
        db,
        `members/${roomID}/${currentUser.uid}`
      ),
      true
    );

    if (!memberSnap.exists()) {

      await pushSystemMessage(
        roomID,
        `<strong>${escapeHTML(userNameDisplay.innerText)}</strong> joined the room`
      );

    }

    await openRoom(
      roomID
    );

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

  } catch (error) {

    console.error(error);

    toast(
      "Could not open room link.",
      "error"
    );

  }

}


// =========================================================
// ROOM INFO
// =========================================================

function updateRoomInfo(
  id,
  pass,
  name,
  url
) {

  roomInfoName.textContent =
    name || id;

  roomInfoID.textContent =
    id;

  roomInfoPassword.textContent =
    pass;

  roomInfoURL.value =
    url || "";

  localStorage.setItem(
    "activeRoom",
    id
  );

}


copyRoomLinkBtn.onclick =
  async () => {

    try {

      await navigator.clipboard.writeText(
        roomInfoURL.value
      );

      toast(
        "Invite link copied.",
        "success"
      );

    } catch {

      roomInfoURL.select();

      document.execCommand(
        "copy"
      );

      toast(
        "Invite link copied.",
        "success"
      );

    }

  };


// =========================================================
// ROOM INFO TOGGLE
// =========================================================

roomInfoToggle.onclick =
  () => {

    roomInfoOpen =
      !roomInfoOpen;

    roomInfoWrapper.classList.toggle(
      "open",
      roomInfoOpen
    );

  };


// =========================================================
// FILTERS
// =========================================================

filterAllBtn.onclick =
  () => {

    roomFilter =
      "all";

    updateFilterButtons();

    loadRooms();

  };


filterCreatedBtn.onclick =
  () => {

    roomFilter =
      "created";

    updateFilterButtons();

    loadRooms();

  };


filterJoinedBtn.onclick =
  () => {

    roomFilter =
      "joined";

    updateFilterButtons();

    loadRooms();

  };


function updateFilterButtons() {

  [
    filterAllBtn,
    filterCreatedBtn,
    filterJoinedBtn
  ]
  .forEach(
    button =>
      button.classList.remove(
        "active"
      )
  );

  if (
    roomFilter === "all"
  ) {

    filterAllBtn.classList.add(
      "active"
    );

  }

  if (
    roomFilter === "created"
  ) {

    filterCreatedBtn.classList.add(
      "active"
    );

  }

  if (
    roomFilter === "joined"
  ) {

    filterJoinedBtn.classList.add(
      "active"
    );

  }

}


// =========================================================
// LOAD ROOMS
// =========================================================

function loadRooms() {

  if (roomsListener) {

    roomsListener();

    roomsListener = null;

  }

  roomsListener =
    onValue(
      ref(db, "members"),
      async snap => {

        roomListEl.innerHTML =
          "";

        if (!snap.exists()) {

          roomCount.textContent =
            "0";

          noRooms.classList.remove(
            "hidden"
          );

          return;

        }

        const rooms = [];

        snap.forEach(
          roomSnap => {

            if (
              roomSnap
                .child(
                  currentUser.uid
                )
                .exists()
            ) {

              rooms.push(
                roomSnap.key
              );

            }

          }
        );

        let rendered =
          0;

        for (
          const id of rooms
        ) {

          const roomSnap =
            await get(
              ref(
                db,
                `rooms/${id}`
              )
            );

          if (
            !roomSnap.exists()
          ) {

            continue;

          }

          const roomData =
            roomSnap.val();

          const isCreator =
            roomData.createdBy ===
            currentUser.uid;

          if (
            roomFilter ===
              "created" &&
            !isCreator
          ) {

            continue;

          }

          if (
            roomFilter ===
              "joined" &&
            isCreator
          ) {

            continue;

          }

          rendered++;

          const row =
            document.createElement(
              "div"
            );

          row.className =
            "room-row";

          if (
            activeRoom === id
          ) {

            row.classList.add(
              "active"
            );

          }


          const button =
            document.createElement(
              "button"
            );

          button.textContent =
            roomData.chatName +
            (
              isCreator
                ? "  ★"
                : ""
            );

          button.title =
            roomData.chatName;

          button.onclick =
            () => {

              openRoom(id);

              if (
                window.innerWidth <= 720
              ) {

                closeMobileRooms();

              }

            };


          const dots =
            document.createElement(
              "span"
            );

          dots.className =
            "room-dots";

          dots.textContent =
            "⋮";

          dots.onclick =
            event => {

              event.stopPropagation();

              showRoomMenu(
                event,
                id,
                isCreator
              );

            };


          row.appendChild(
            button
          );

          row.appendChild(
            dots
          );

          roomListEl.appendChild(
            row
          );

        }

        roomCount.textContent =
          rendered;

        noRooms.textContent =
          rendered
            ? "No rooms yet"
            : "No rooms match this filter.";

        noRooms.classList.toggle(
          "hidden",
          rendered > 0
        );

        applyRoomSearch();

      }
    );

}


// =========================================================
// ROOM SEARCH
// =========================================================

roomSearchInput.addEventListener(
  "input",
  applyRoomSearch
);


clearRoomSearch.onclick =
  () => {

    roomSearchInput.value =
      "";

    applyRoomSearch();

    roomSearchInput.focus();

  };


function applyRoomSearch() {

  const query =
    roomSearchInput.value
      .trim()
      .toLowerCase();

  clearRoomSearch.classList.toggle(
    "hidden",
    !query
  );

  const rows =
    Array.from(
      roomListEl.children
    );

  let visible = 0;

  rows.forEach(
    row => {

      const button =
        row.querySelector(
          "button"
        );

      const name =
        button
          ?.textContent
          .toLowerCase() ||
        "";

      const matches =
        !query ||
        name.includes(query);

      row.style.display =
        matches
          ? "flex"
          : "none";

      if (matches) {
        visible++;
      }

    }
  );

  if (
    query &&
    visible === 0
  ) {

    noRooms.textContent =
      "No matching rooms found.";

    noRooms.classList.remove(
      "hidden"
    );

  } else if (
    visible === 0
  ) {

    noRooms.classList.remove(
      "hidden"
    );

  } else {

    noRooms.classList.add(
      "hidden"
    );

  }

}


// =========================================================
// ROOM MENU
// =========================================================

function closeAllMenus() {

  if (openMenu) {

    openMenu.remove();

    openMenu = null;

  }

  [
    "roomMenu",
    "kickMenu"
  ]
  .forEach(
    id => {

      document
        .getElementById(id)
        ?.remove();

    }
  );

}


function showRoomMenu(
  event,
  roomID,
  isCreator
) {

  closeAllMenus();

  const menu =
    document.createElement(
      "div"
    );

  menu.id =
    "roomMenu";

  menu.className =
    "room-menu";

  menu.style.position =
    "fixed";

  menu.style.zIndex =
    "10000";

  document.body.appendChild(
    menu
  );

  const addItem =
    (
      text,
      callback,
      danger = false
    ) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        `room-menu-item ${
          danger
            ? "danger"
            : ""
        }`;

      item.textContent =
        text;

      item.onclick =
        async e => {

          e.stopPropagation();

          menu.remove();

          try {

            await callback();

          } catch (error) {

            console.error(error);

            toast(
              "Action failed.",
              "error"
            );

          }

        };

      menu.appendChild(
        item
      );

    };


  if (!isCreator) {

    addItem(
      "Leave Room",
      () =>
        leaveRoom(roomID)
    );

  }


  if (isCreator) {

    addItem(
      "Rename Room",
      () =>
        renameRoom(roomID)
    );

    addItem(
      "Change Password",
      () =>
        changeRoomPassword(roomID)
    );

    addItem(
      "Blocked Users",
      () =>
        openKickBlockModal(roomID)
    );

    addItem(
      "Delete Room",
      () =>
        deleteRoom(roomID),
      true
    );

  }


  const rect =
    event.target.getBoundingClientRect();

  let left =
    rect.left;

  let top =
    rect.bottom + 5;

  if (
    left + 170 >
    window.innerWidth
  ) {

    left =
      window.innerWidth - 180;

  }

  if (
    top + 180 >
    window.innerHeight
  ) {

    top =
      rect.top - 180;

  }

  menu.style.left =
    `${Math.max(8, left)}px`;

  menu.style.top =
    `${Math.max(8, top)}px`;


  setTimeout(() => {

    const close =
      e => {

        if (
          !menu.contains(
            e.target
          )
        ) {

          menu.remove();

          document.removeEventListener(
            "click",
            close
          );

        }

      };

    document.addEventListener(
      "click",
      close
    );

  }, 10);

}


// =========================================================
// RENAME ROOM
// =========================================================

async function renameRoom(
  roomID
) {

  const snap =
    await get(
      ref(
        db,
        `rooms/${roomID}`
      )
    );

  if (
    !snap.exists() ||
    snap.val().createdBy !==
      currentUser.uid
  ) {

    return;

  }

  const newName =
    prompt(
      "Enter new room name:",
      snap.val().chatName
    );

  if (
    !newName ||
    !newName.trim()
  ) {

    return;

  }

  await update(
    ref(
      db,
      `rooms/${roomID}`
    ),
    {
      chatName:
        newName.trim()
    }
  );

  if (
    activeRoom === roomID
  ) {

    chatHeader.textContent =
      newName.trim();

  }

  loadRooms();

  toast(
    "Room renamed.",
    "success"
  );

}


// =========================================================
// CHANGE PASSWORD
// =========================================================

async function changeRoomPassword(
  roomID
) {

  const snap =
    await get(
      ref(
        db,
        `rooms/${roomID}`
      )
    );

  if (
    !snap.exists() ||
    snap.val().createdBy !==
      currentUser.uid
  ) {

    return;

  }

  const newPass =
    prompt(
      "New password (6-12 lowercase letters/digits):"
    );

  if (
    !newPass ||
    !/^[a-z0-9]{6,12}$/.test(
      newPass
    )
  ) {

    toast(
      "Invalid password format.",
      "error"
    );

    return;

  }

  const newURL =
    `${location.origin}${location.pathname}?room=${roomID}&pass=${newPass}`;

  await update(
    ref(
      db,
      `rooms/${roomID}`
    ),
    {
      pass:
        newPass,

      roomURL:
        newURL
    }
  );

  if (
    activeRoom === roomID
  ) {

    updateRoomInfo(
      roomID,
      newPass,
      snap.val().chatName,
      newURL
    );

  }

  toast(
    "Room password changed.",
    "success"
  );

}


// =========================================================
// DELETE ROOM
// =========================================================

async function deleteRoom(
  roomID
) {

  const snap =
    await get(
      ref(
        db,
        `rooms/${roomID}`
      )
    );

  if (
    !snap.exists() ||
    snap.val().createdBy !==
      currentUser.uid
  ) {

    return;

  }

  if (
    !confirm(
      "Delete this room permanently?"
    )
  ) {

    return;

  }

  await remove(
    ref(
      db,
      `rooms/${roomID}`
    )
  );

  await remove(
    ref(
      db,
      `members/${roomID}`
    )
  );

  await remove(
    ref(
      db,
      `messages/${roomID}`
    )
  );

  await remove(
    ref(
      db,
      `typing/${roomID}`
    )
  );

  await remove(
    ref(
      db,
      `kicked/${roomID}`
    )
  );

  if (
    activeRoom === roomID
  ) {

    activeRoom =
      null;

    localStorage.removeItem(
      "activeRoom"
    );

    clearUI();

  }

  toast(
    "Room deleted.",
    "success"
  );

}


// =========================================================
// LEAVE ROOM
// =========================================================

async function leaveRoom(
  roomID
) {

  if (
    !confirm(
      "Leave this room?"
    )
  ) {

    return;

  }

  await pushSystemMessage(
    roomID,
    `<strong>${escapeHTML(userNameDisplay.innerText)}</strong> left the room`
  );

  await remove(
    ref(
      db,
      `members/${roomID}/${currentUser.uid}`
    )
  );

  if (
    activeRoom === roomID
  ) {

    clearUI();

  }

  loadRooms();

  toast(
    "You left the room.",
    "success"
  );

}


// =========================================================
// SYSTEM MESSAGE
// =========================================================

async function pushSystemMessage(
  roomID,
  text
) {

  if (!roomID) return;

  await push(
    ref(
      db,
      `messages/${roomID}`
    ),
    {
      type:
        "system",

      text,

      time:
        Date.now()
    }
  );

}


// =========================================================
// OPEN ROOM
// =========================================================

async function openRoom(
  roomID
) {

  if (!roomID) return;

  const snap =
    await get(
      ref(
        db,
        `rooms/${roomID}`
      )
    );

  if (!snap.exists()) {

    toast(
      "This room no longer exists.",
      "error"
    );

    clearUI();

    return;

  }

  const memberSnap =
    await get(
      ref(
        db,
        `members/${roomID}/${currentUser.uid}`
      )
    );

  if (
    !memberSnap.exists()
  ) {

    toast(
      "You are not a member of this room.",
      "error"
    );

    return;

  }

  activeRoom =
    roomID;

  activeRoomCreator =
    snap.val().createdBy;

  localStorage.setItem(
    "activeRoom",
    roomID
  );

  const roomData =
    snap.val();

  emptyChatState.classList.add(
    "hidden"
  );

  chatContent.classList.remove(
    "hidden"
  );

  chatHeader.textContent =
    roomData.chatName;

  chatRoomInitial.textContent =
    (
      roomData.chatName ||
      "C"
    )
    .trim()
    .charAt(0)
    .toUpperCase();

  updateRoomInfo(
    roomID,
    roomData.pass,
    roomData.chatName,
    roomData.roomURL
  );

  listenMessages(
    roomID
  );

  listenTyping(
    roomID
  );

  listenForKick(
    roomID
  );

  loadRoomMembers(
    roomID
  );

  usersPanelBtn.style.display =
    "grid";

  loadRooms();

  if (
    window.innerWidth <= 720
  ) {

    closeMobileRooms();

  }

}


// =========================================================
// LISTEN MESSAGES
// =========================================================

function listenMessages(
  roomID
) {

  if (messagesListener) {

    messagesListener();

    messagesListener =
      null;

  }

  const msgRef =
    ref(
      db,
      `messages/${roomID}`
    );

  messagesListener =
    onValue(
      msgRef,
      async snap => {

        messagesEl.innerHTML =
          "";

        if (!snap.exists()) {

          messagesEl.innerHTML =
            `
              <div class="center muted">
                No messages yet
              </div>
            `;

          return;

        }

        const fragment =
          document.createDocumentFragment();

        let hasMessages =
          false;

        snap.forEach(
          child => {

            const data =
              child.val();

            const msgID =
              child.key;

            hasMessages =
              true;

            if (
              data.uid &&
              data.uid !==
              currentUser.uid
            ) {

              set(
                ref(
                  db,
                  `messages/${roomID}/${msgID}/seenBy/${currentUser.uid}`
                ),
                true
              );

            }

            if (
              data.type ===
              "system"
            ) {

              const system =
                document.createElement(
                  "div"
                );

              system.className =
                "system-message";

              system.innerHTML =
                data.text || "";

              fragment.appendChild(
                system
              );

              return;

            }


            const isMine =
              data.uid ===
              currentUser.uid;


            const wrap =
              document.createElement(
                "div"
              );

            wrap.id =
              `msg-${msgID}`;

            wrap.className =
              `message ${
                isMine
                  ? "mine"
                  : ""
              }`;


            // ---------------- AVATAR
            const avatar =
              document.createElement(
                "img"
              );

            avatar.className =
              "msg-avatar";

            avatar.src =
              data.photoURL ||
              DEFAULT_AVATAR;

            avatar.alt =
              data.nickname ||
              "User";

            avatar.onclick =
              () =>
                openProfileModal(
                  data.uid,
                  isMine
                );


            // ---------------- BUBBLE
            const bubble =
              document.createElement(
                "div"
              );

            bubble.className =
              "bubble";


            // ---------------- REPLY
            if (
              data.replyTo
            ) {

              const replyBox =
                document.createElement(
                  "div"
                );

              replyBox.className =
                "reply-box";

              const replyName =
                document.createElement(
                  "div"
                );

              replyName.className =
                "reply-name";

              replyName.textContent =
                data.replyTo.nickname ||
                "User";

              const replyText =
                document.createElement(
                  "div"
                );

              replyText.className =
                "reply-text";

              replyText.textContent =
                data.replyTo.text ||
                "Attachment";

              replyBox.appendChild(
                replyName
              );

              replyBox.appendChild(
                replyText
              );

              replyBox.onclick =
                () => {

                  const target =
                    document.getElementById(
                      `msg-${data.replyTo.msgID}`
                    );

                  if (!target) return;

                  target.scrollIntoView({
                    behavior:
                      "smooth",

                    block:
                      "center"
                  });

                  target.animate(
                    [
                      {
                        transform:
                          "scale(1)"
                      },

                      {
                        transform:
                          "scale(1.025)"
                      },

                      {
                        transform:
                          "scale(1)"
                      }
                    ],
                    {
                      duration:
                        450
                    }
                  );

                };

              bubble.appendChild(
                replyBox
              );

            }


            // ---------------- NAME
            const name =
              document.createElement(
                "div"
              );

            name.className =
              "msg-name";

            name.textContent =
              data.nickname ||
              "User";

            if (
              data.uid ===
              activeRoomCreator
            ) {

              name.style.color =
                "#ff6578";

            } else {

              name.style.color =
                "#57d889";

            }

            bubble.appendChild(
              name
            );


            // ---------------- CONTENT
            const content =
              document.createElement(
                "div"
              );


            if (
              data.type ===
              "image"
            ) {

              const img =
                document.createElement(
                  "img"
                );

              img.src =
                data.text;

              img.className =
                "chat-image";

              img.alt =
                "Shared image";

              img.onclick =
                () =>
                  openImageViewer(
                    data.text
                  );

              content.appendChild(
                img
              );


            } else if (
              data.type ===
              "link"
            ) {

              const a =
                document.createElement(
                  "a"
                );

              let href =
                data.text ||
                "";

              if (
                !/^https?:\/\//i.test(
                  href
                )
              ) {

                href =
                  "https://" +
                  href;

              }

              a.href =
                href;

              a.target =
                "_blank";

              a.rel =
                "noopener noreferrer";

              a.textContent =
                data.text;

              a.className =
                "chat-link";

              content.appendChild(
                a
              );


            } else if (
              data.type ===
              "file"
            ) {

              const wrapper =
                document.createElement(
                  "a"
                );

              wrapper.href =
                "#";

              wrapper.className =
                "chat-document";

              wrapper.onclick =
                event => {

                  event.preventDefault();

                  if (
                    !data.fileData
                  ) {

                    toast(
                      "File data is unavailable.",
                      "error"
                    );

                    return;

                  }

                  const a =
                    document.createElement(
                      "a"
                    );

                  a.href =
                    data.fileData;

                  a.download =
                    data.text ||
                    "download";

                  document.body.appendChild(
                    a
                  );

                  a.click();

                  a.remove();

                };

              const icon =
                document.createElement(
                  "div"
                );

              icon.className =
                "doc-icon";

              icon.textContent =
                "📄";


              const info =
                document.createElement(
                  "div"
                );

              info.className =
                "doc-info";


              const docName =
                document.createElement(
                  "div"
                );

              docName.className =
                "doc-name";

              docName.textContent =
                data.text ||
                "Document";


              const docSize =
                document.createElement(
                  "div"
                );

              docSize.className =
                "doc-size";

              docSize.textContent =
                "Click to download";


              info.appendChild(
                docName
              );

              info.appendChild(
                docSize
              );

              wrapper.appendChild(
                icon
              );

              wrapper.appendChild(
                info
              );

              content.appendChild(
                wrapper
              );


            } else {

              const text =
                document.createElement(
                  "div"
                );

              text.textContent =
                data.text ||
                "[unsupported message]";

              content.appendChild(
                text
              );

            }

            bubble.appendChild(
              content
            );


            // ---------------- REACTIONS
            if (
              data.reactions &&
              Object.keys(
                data.reactions
              ).length
            ) {

              const reactBox =
                document.createElement(
                  "div"
                );

              reactBox.className =
                "reaction-box";

              const counts =
                {};

              Object.values(
                data.reactions
              )
              .forEach(
                reaction => {

                  counts[
                    reaction
                  ] =
                    (
                      counts[
                        reaction
                      ] || 0
                    ) + 1;

                }
              );

              Object.entries(
                counts
              )
              .forEach(
                ([emoji, count]) => {

                  const span =
                    document.createElement(
                      "span"
                    );

                  span.className =
                    "reaction-item";

                  span.textContent =
                    `${emoji} ${count}`;

                  reactBox.appendChild(
                    span
                  );

                }
              );

              bubble.appendChild(
                reactBox
              );

            }


            // ---------------- TIME
            const time =
              document.createElement(
                "div"
              );

            time.className =
              "msg-time";

            const messageTime =
              data.time ||
              data.timestamp ||
              Date.now();

            const timeText =
              new Date(
                messageTime
              ).toLocaleTimeString(
                [],
                {
                  hour:
                    "2-digit",

                  minute:
                    "2-digit",

                  hour12:
                    true
                }
              );

            time.textContent =
              data.edited
                ? `${timeText} · edited`
                : timeText;

            bubble.appendChild(
              time
            );


            // ---------------- MENU BUTTON
            const menuBtn =
              document.createElement(
                "div"
              );

            menuBtn.className =
              "message-menu-button";

            menuBtn.textContent =
              "⋮";

            menuBtn.title =
              "Message options";


            const menu =
              document.createElement(
                "div"
              );

            menu.className =
              "room-menu";

            menu.style.position =
              "fixed";

            menu.style.display =
              "none";

            menu.style.zIndex =
              "99999";


            const addMenuItem =
              (
                text,
                callback,
                danger = false
              ) => {

                const item =
                  document.createElement(
                    "div"
                  );

                item.className =
                  `room-menu-item ${
                    danger
                      ? "danger"
                      : ""
                  }`;

                item.textContent =
                  text;

                item.onclick =
                  async event => {

                    event.stopPropagation();

                    menu.style.display =
                      "none";

                    openMenu =
                      null;

                    try {

                      await callback();

                    } catch (error) {

                      console.error(
                        error
                      );

                      toast(
                        "Action failed.",
                        "error"
                      );

                    }

                  };

                menu.appendChild(
                  item
                );

              };


            addMenuItem(
              "Copy",
              async () => {

                await navigator.clipboard.writeText(
                  data.text || ""
                );

                toast(
                  "Copied.",
                  "success"
                );

              }
            );


            addMenuItem(
              "React",
              () =>
                showReactionBar(
                  msgID,
                  menuBtn
                )
            );


            addMenuItem(
              "Reply",
              () => {

                currentReply =
                  {
                    msgID,
                    text:
                      data.text ||
                      "Attachment",

                    nickname:
                      data.nickname ||
                      "User"
                  };

                showReplyBar(
                  currentReply
                );

                msgInput.focus();

              }
            );


            addMenuItem(
              "Seen",
              () =>
                openSeenOverlay(
                  roomID,
                  msgID
                )
            );


            if (
              isMine &&
              data.type ===
              "text"
            ) {

              addMenuItem(
                "Edit",
                async () => {

                  const newText =
                    prompt(
                      "Edit message:",
                      data.text
                    );

                  if (
                    newText === null
                  ) {

                    return;

                  }

                  const trimmed =
                    newText.trim();

                  if (!trimmed) {

                    return;

                  }

                  await update(
                    ref(
                      db,
                      `messages/${roomID}/${msgID}`
                    ),
                    {
                      text:
                        trimmed,

                      edited:
                        true,

                      editTime:
                        Date.now()
                    }
                  );

                }
              );

            }


            if (isMine) {

              addMenuItem(
                "Delete",
                async () => {

                  if (
                    !confirm(
                      "Delete this message?"
                    )
                  ) {

                    return;

                  }

                  await remove(
                    ref(
                      db,
                      `messages/${roomID}/${msgID}`
                    )
                  );

                  await pushSystemMessage(
                    roomID,
                    `<strong>${escapeHTML(data.nickname || "User")}</strong> deleted a message`
                  );

                },
                true
              );

            }


            document.body.appendChild(
              menu
            );


            menuBtn.onclick =
              event => {

                event.stopPropagation();

                closeAllMenus();

                const rect =
                  menuBtn.getBoundingClientRect();

                menu.style.display =
                  "block";

                let left =
                  rect.left;

                let top =
                  rect.bottom + 5;

                if (
                  left + 160 >
                  window.innerWidth
                ) {

                  left =
                    window.innerWidth -
                    170;

                }

                if (
                  top + 200 >
                  window.innerHeight
                ) {

                  top =
                    rect.top -
                    200;

                }

                menu.style.left =
                  `${Math.max(8, left)}px`;

                menu.style.top =
                  `${Math.max(8, top)}px`;

                openMenu =
                  menu;

              };


            // ---------------- BUILD
            if (isMine) {

              wrap.appendChild(
                menuBtn
              );

              wrap.appendChild(
                bubble
              );

              wrap.appendChild(
                avatar
              );

            } else {

              wrap.appendChild(
                avatar
              );

              wrap.appendChild(
                bubble
              );

              wrap.appendChild(
                menuBtn
              );

            }

            fragment.appendChild(
              wrap
            );

          }
        );

        if (!hasMessages) {

          messagesEl.innerHTML =
            `
              <div class="center muted">
                No messages yet
              </div>
            `;

        } else {

          messagesEl.appendChild(
            fragment
          );

          requestAnimationFrame(
            () => {

              messagesEl.scrollTop =
                messagesEl.scrollHeight;

            }
          );

        }

      }
    );

}


// =========================================================
// REACTION BAR
// =========================================================

async function showReactionBar(
  msgID,
  anchor
) {

  const old =
    document.getElementById(
      "reactionBar"
    );

  if (old) old.remove();

  const bar =
    document.createElement(
      "div"
    );

  bar.id =
    "reactionBar";

  bar.className =
    "room-menu";

  bar.style.position =
    "fixed";

  bar.style.display =
    "flex";

  bar.style.gap =
    "4px";

  bar.style.padding =
    "6px";

  bar.style.zIndex =
    "999999";


  REACTIONS.forEach(
    emoji => {

      const button =
        document.createElement(
          "button"
        );

      button.textContent =
        emoji;

      button.style.background =
        "transparent";

      button.style.border =
        "0";

      button.style.cursor =
        "pointer";

      button.style.fontSize =
        "19px";

      button.style.padding =
        "4px 5px";

      button.style.borderRadius =
        "8px";

      button.onmouseenter =
        () => {

          button.style.background =
            "rgba(255,255,255,0.08)";

          button.style.transform =
            "scale(1.18)";

        };

      button.onmouseleave =
        () => {

          button.style.background =
            "transparent";

          button.style.transform =
            "scale(1)";

        };

      button.onclick =
        async event => {

          event.stopPropagation();

          const msgRef =
            ref(
              db,
              `messages/${activeRoom}/${msgID}`
            );

          const snap =
            await get(
              msgRef
            );

          if (!snap.exists()) {

            bar.remove();

            return;

          }

          const data =
            snap.val();

          const reactions =
            {
              ...(data.reactions || {})
            };

          if (
            reactions[
              currentUser.uid
            ] === emoji
          ) {

            delete reactions[
              currentUser.uid
            ];

          } else {

            reactions[
              currentUser.uid
            ] =
              emoji;

          }

          await update(
            msgRef,
            {
              reactions
            }
          );

          bar.remove();

        };

      bar.appendChild(
        button
      );

    }
  );


  document.body.appendChild(
    bar
  );

  const rect =
    anchor.getBoundingClientRect();

  let left =
    rect.left -
    50;

  let top =
    rect.top -
    55;

  if (
    left < 8
  ) left = 8;

  if (
    left + 230 >
    window.innerWidth
  ) {

    left =
      window.innerWidth -
      238;

  }

  bar.style.left =
    `${left}px`;

  bar.style.top =
    `${Math.max(8, top)}px`;


  setTimeout(
    () => {

      const close =
        event => {

          if (
            !bar.contains(
              event.target
            )
          ) {

            bar.remove();

            document.removeEventListener(
              "click",
              close
            );

          }

        };

      document.addEventListener(
        "click",
        close
      );

    },
    10
  );

}


// =========================================================
// REPLY BAR
// =========================================================

function showReplyBar(
  data
) {

  replyBar.innerHTML =
    `
      <div class="reply-bar-inner">

        <div class="reply-bar-copy">

          <div class="reply-bar-title">
            Replying to ${escapeHTML(data.nickname)}
          </div>

          <div class="reply-bar-text">
            ${escapeHTML(data.text)}
          </div>

        </div>

        <button
          class="reply-cancel"
          id="cancelReply"
        >
          ×
        </button>

      </div>
    `;

  replyBar.style.display =
    "block";

  document
    .getElementById(
      "cancelReply"
    )
    .onclick =
    cancelReply;

}


function cancelReply() {

  currentReply =
    null;

  replyBar.style.display =
    "none";

  replyBar.innerHTML =
    "";

}


// =========================================================
// SEND MESSAGE
// =========================================================

sendMsg.onclick =
  sendMessage;


msgInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  }
);


function sendMessage() {

  if (
    !currentUser ||
    !activeRoom
  ) {

    return;

  }

  const text =
    msgInput.value.trim();

  if (!text) return;

  const message =
    {

      uid:
        currentUser.uid,

      nickname:
        userNameDisplay.innerText,

      photoURL:
        userPhoto.src,

      text,

      time:
        Date.now(),

      type:
        "text",

      replyTo:
        currentReply
          ? {
              msgID:
                currentReply.msgID,

              text:
                currentReply.text,

              nickname:
                currentReply.nickname
            }
          : null,

      reactions:
        {}

    };


  push(
    ref(
      db,
      `messages/${activeRoom}`
    ),
    message
  )
  .then(
    () => {

      msgInput.value =
        "";

      autoResizeInput();

      cancelReply();

      remove(
        ref(
          db,
          `typing/${activeRoom}/${currentUser.uid}`
        )
      );

    }
  )
  .catch(
    error => {

      console.error(
        error
      );

      toast(
        "Message failed to send.",
        "error"
      );

    }
  );

}


// =========================================================
// TEXTAREA RESIZE
// =========================================================

msgInput.addEventListener(
  "input",
  () => {

    autoResizeInput();

    updateTyping();

  }
);


function autoResizeInput() {

  msgInput.style.height =
    "auto";

  msgInput.style.height =
    `${Math.min(
      msgInput.scrollHeight,
      120
    )}px`;

}


// =========================================================
// TYPING
// =========================================================

function updateTyping() {

  if (
    !activeRoom ||
    !currentUser
  ) return;

  const typingRef =
    ref(
      db,
      `typing/${activeRoom}/${currentUser.uid}`
    );

  set(
    typingRef,
    true
  );

  if (typingTimeout) {

    clearTimeout(
      typingTimeout
    );

  }

  typingTimeout =
    setTimeout(
      () => {

        remove(
          typingRef
        );

      },
      1500
    );

}


function listenTyping(
  roomID
) {

  if (typingListener) {

    typingListener();

    typingListener =
      null;

  }

  const typingRef =
    ref(
      db,
      `typing/${roomID}`
    );

  typingListener =
    onValue(
      typingRef,
      async snap => {

        if (
          !snap.exists()
        ) {

          hideTypingIndicator();

          return;

        }

        const typingUIDs =
          [];

        snap.forEach(
          child => {

            if (
              child.key !==
              currentUser.uid
            ) {

              typingUIDs.push(
                child.key
              );

            }

          }
        );

        if (
          typingUIDs.length === 0
        ) {

          hideTypingIndicator();

          return;

        }

        const uid =
          typingUIDs[0];

        let user =
          usersCache[uid];

        if (!user) {

          const userSnap =
            await get(
              ref(
                db,
                `users/${uid}`
              )
            );

          user =
            userSnap.exists()
              ? userSnap.val()
              : {
                  nickname:
                    "Someone",

                  photoURL:
                    DEFAULT_AVATAR
                };

          usersCache[uid] =
            user;

        }

        typingIndicator.innerHTML =
          `
            <img
              src="${user.photoURL || DEFAULT_AVATAR}"
              class="typing-avatar"
              alt=""
            >

            <div class="typing-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          `;

        typingIndicator.classList.remove(
          "hidden"
        );

      }
    );

}


function hideTypingIndicator() {

  typingIndicator.classList.add(
    "hidden"
  );

}


// =========================================================
// ATTACHMENTS
// =========================================================

const attachmentFileInput =
  document.createElement(
    "input"
  );

attachmentFileInput.type =
  "file";

attachmentFileInput.style.display =
  "none";

document.body.appendChild(
  attachmentFileInput
);


attachmentBtn.onclick =
  event => {

    event.stopPropagation();

    attachmentMenu.classList.toggle(
      "show"
    );

  };


document.addEventListener(
  "click",
  event => {

    if (
      !attachmentMenu.contains(
        event.target
      ) &&
      event.target !==
      attachmentBtn
    ) {

      attachmentMenu.classList.remove(
        "show"
      );

    }

  }
);


imageBtn.onclick =
  () => {

    if (!activeRoom) {

      toast(
        "Select a room first.",
        "error"
      );

      return;

    }

    attachmentFileInput.accept =
      "image/*";

    attachmentFileInput.click();

    attachmentMenu.classList.remove(
      "show"
    );

  };


documentBtn.onclick =
  () => {

    if (!activeRoom) {

      toast(
        "Select a room first.",
        "error"
      );

      return;

    }

    attachmentFileInput.accept =
      "*/*";

    attachmentFileInput.click();

    attachmentMenu.classList.remove(
      "show"
    );

  };


linkBtn.onclick =
  async () => {

    attachmentMenu.classList.remove(
      "show"
    );

    if (!activeRoom) {

      toast(
        "Select a room first.",
        "error"
      );

      return;

    }

    let url =
      prompt(
        "Paste the link:"
      );

    if (!url) return;

    url =
      url.trim();

    if (
      !/^https?:\/\//i.test(
        url
      )
    ) {

      url =
        "https://" +
        url;

    }

    await push(
      ref(
        db,
        `messages/${activeRoom}`
      ),
      {
        uid:
          currentUser.uid,

        nickname:
          userNameDisplay.innerText,

        photoURL:
          userPhoto.src,

        text:
          url,

        type:
          "link",

        time:
          Date.now()
      }
    );

  };


attachmentFileInput.onchange =
  event => {

    const file =
      event.target.files[0];

    if (!file) return;

    if (!activeRoom) {

      toast(
        "Select a room first.",
        "error"
      );

      return;

    }

    // Images
    if (
      file.type.startsWith(
        "image/"
      )
    ) {

      if (
        file.size >
        5 * 1024 * 1024
      ) {

        toast(
          "Images must be under 5 MB.",
          "error"
        );

        attachmentFileInput.value =
          "";

        return;

      }

      const reader =
        new FileReader();

      reader.onload =
        async () => {

          await push(
            ref(
              db,
              `messages/${activeRoom}`
            ),
            {
              uid:
                currentUser.uid,

              nickname:
                userNameDisplay.innerText,

              photoURL:
                userPhoto.src,

              text:
                reader.result,

              type:
                "image",

              time:
                Date.now()
            }
          );

        };

      reader.readAsDataURL(
        file
      );

    } else {

      // Other files
      if (
        file.size >
        3 * 1024 * 1024
      ) {

        toast(
          "Files must be under 3 MB.",
          "error"
        );

        attachmentFileInput.value =
          "";

        return;

      }

      const reader =
        new FileReader();

      reader.onload =
        async () => {

          await push(
            ref(
              db,
              `messages/${activeRoom}`
            ),
            {
              uid:
                currentUser.uid,

              nickname:
                userNameDisplay.innerText,

              photoURL:
                userPhoto.src,

              text:
                file.name,

              fileData:
                reader.result,

              fileType:
                file.type,

              type:
                "file",

              time:
                Date.now()
            }
          );

        };

      reader.readAsDataURL(
        file
      );

    }

    attachmentFileInput.value =
      "";

  };


// =========================================================
// IMAGE VIEWER
// =========================================================

function openImageViewer(
  src
) {

  imageViewerImg.src =
    src;

  imageViewer.classList.remove(
    "hidden"
  );

  requestAnimationFrame(
    () => {

      imageViewer.classList.add(
        "show"
      );

    }
  );

}


function closeImageViewer() {

  imageViewer.classList.remove(
    "show"
  );

  setTimeout(
    () => {

      imageViewer.classList.add(
        "hidden"
      );

      imageViewerImg.src =
        "";

    },
    250
  );

}


imageViewerClose.onclick =
  closeImageViewer;


imageViewer.onclick =
  event => {

    if (
      event.target ===
      imageViewer
    ) {

      closeImageViewer();

    }

  };


imageViewerDownload.onclick =
  () => {

    if (
      !imageViewerImg.src
    ) return;

    const a =
      document.createElement(
        "a"
      );

    a.href =
      imageViewerImg.src;

    a.download =
      "chatverix-image.png";

    document.body.appendChild(
      a
    );

    a.click();

    a.remove();

  };


// =========================================================
// SEEN OVERLAY
// =========================================================

async function openSeenOverlay(
  roomID,
  msgID
) {

  seenOverlay.classList.remove(
    "hidden"
  );

  seenList.innerHTML =
    `
      <div class="muted center">
        Loading...
      </div>
    `;

  try {

    const snap =
      await get(
        ref(
          db,
          `messages/${roomID}/${msgID}/seenBy`
        )
      );

    seenList.innerHTML =
      "";

    if (
      !snap.exists()
    ) {

      seenList.innerHTML =
        `
          <div class="muted center">
            No one has seen this yet.
          </div>
        `;

      return;

    }

    const data =
      snap.val();

    for (
      const uid of Object.keys(data)
    ) {

      let user =
        usersCache[uid];

      if (!user) {

        const userSnap =
          await get(
            ref(
              db,
              `users/${uid}`
            )
          );

        user =
          userSnap.exists()
            ? userSnap.val()
            : {
                nickname:
                  "User",

                photoURL:
                  DEFAULT_AVATAR
              };

        usersCache[uid] =
          user;

      }

      const row =
        document.createElement(
          "div"
        );

      row.style.display =
        "flex";

      row.style.alignItems =
        "center";

      row.style.gap =
        "10px";

      row.style.padding =
        "8px";

      row.style.borderRadius =
        "10px";

      row.style.background =
        "rgba(255,255,255,0.035)";

      row.style.marginBottom =
        "6px";


      const img =
        document.createElement(
          "img"
        );

      img.src =
        user.photoURL ||
        DEFAULT_AVATAR;

      img.style.width =
        "32px";

      img.style.height =
        "32px";

      img.style.borderRadius =
        "50%";

      img.style.objectFit =
        "cover";


      const name =
        document.createElement(
          "span"
        );

      name.textContent =
        user.nickname ||
        "User";

      name.style.fontSize =
        "11px";

      name.style.fontWeight =
        "700";


      row.appendChild(
        img
      );

      row.appendChild(
        name
      );

      seenList.appendChild(
        row
      );

    }

  } catch (error) {

    console.error(error);

    seenList.innerHTML =
      `
        <div class="muted center">
          Could not load seen information.
        </div>
      `;

  }

}


function closeSeenOverlay() {

  seenOverlay.classList.add(
    "hidden"
  );

}


window.closeSeenOverlay =
  closeSeenOverlay;


// =========================================================
// USERS PANEL
// =========================================================

usersPanelBtn.onclick =
  () => {

    usersPanelMenu.classList.add(
      "open"
    );

  };


closeUsersPanel.onclick =
  () => {

    usersPanelMenu.classList.remove(
      "open"
    );

  };


async function loadRoomMembers(
  roomID
) {

  if (!roomID) return;

  if (usersPanelUnsub) {

    usersPanelUnsub();

    usersPanelUnsub =
      null;

  }

  Object.values(
    statusUnsubscribers
  )
  .forEach(
    unsubscribe => {

      if (unsubscribe)
        unsubscribe();

    }
  );

  statusUnsubscribers =
    {};

  const membersRef =
    ref(
      db,
      `members/${roomID}`
    );

  usersPanelUnsub =
    onValue(
      membersRef,
      async snap => {

        liveUsersList.innerHTML =
          "";

        if (
          !snap.exists()
        ) {

          liveUsersList.innerHTML =
            `
              <div class="muted center">
                No users in this room.
              </div>
            `;

          return;

        }

        const uids =
          Object.keys(
            snap.val()
          );

        const users =
          await Promise.all(
            uids.map(
              async uid => {

                let user =
                  usersCache[uid];

                if (!user) {

                  const userSnap =
                    await get(
                      ref(
                        db,
                        `users/${uid}`
                      )
                    );

                  user =
                    userSnap.exists()
                      ? userSnap.val()
                      : {
                          nickname:
                            "User",

                          photoURL:
                            DEFAULT_AVATAR
                        };

                  usersCache[uid] =
                    user;

                }

                return {
                  uid,
                  ...user
                };

              }
            )
          );


        users.forEach(
          user => {

            const item =
              document.createElement(
                "div"
              );

            item.className =
              "userItem";


            const avatarWrapper =
              document.createElement(
                "div"
              );

            avatarWrapper.style.position =
              "relative";

            avatarWrapper.style.width =
              "40px";

            avatarWrapper.style.height =
              "40px";


            const avatar =
              document.createElement(
                "img"
              );

            avatar.className =
              "user-avatar";

            avatar.src =
              user.photoURL ||
              DEFAULT_AVATAR;

            avatar.style.width =
              "100%";

            avatar.style.height =
              "100%";

            avatar.style.borderRadius =
              "50%";

            avatar.style.objectFit =
              "cover";

            avatar.style.cursor =
              "pointer";


            avatar.onclick =
              () =>
                openProfileModal(
                  user.uid,
                  user.uid ===
                    currentUser.uid
                );


            const statusDot =
              document.createElement(
                "span"
              );

            statusDot.className =
              "status-dot offline";

            statusDot.style.position =
              "absolute";

            statusDot.style.right =
              "0";

            statusDot.style.bottom =
              "0";

            statusDot.style.width =
              "10px";

            statusDot.style.height =
              "10px";

            statusDot.style.border =
              "2px solid #10171f";


            avatarWrapper.appendChild(
              avatar
            );

            avatarWrapper.appendChild(
              statusDot
            );


            const info =
              document.createElement(
                "div"
              );

            info.style.flex =
              "1";

            info.style.minWidth =
              "0";


            const name =
              document.createElement(
                "div"
              );

            name.textContent =
              user.nickname ||
              "User";

            name.style.fontSize =
              "11px";

            name.style.fontWeight =
              "700";

            name.style.whiteSpace =
              "nowrap";

            name.style.overflow =
              "hidden";

            name.style.textOverflow =
              "ellipsis";


            const role =
              document.createElement(
                "div"
              );

            role.textContent =
              user.uid ===
              activeRoomCreator
                ? "Room creator"
                : "Member";

            role.style.fontSize =
              "8px";

            role.style.marginTop =
              "2px";

            role.style.color =
              user.uid ===
              activeRoomCreator
                ? "#ff6578"
                : "#74808c";


            info.appendChild(
              name
            );

            info.appendChild(
              role
            );


            item.appendChild(
              avatarWrapper
            );

            item.appendChild(
              info
            );


            if (
              currentUser.uid ===
                activeRoomCreator &&
              user.uid !==
                currentUser.uid
            ) {

              const kickBtn =
                document.createElement(
                  "button"
                );

              kickBtn.textContent =
                "Kick";

              kickBtn.style.padding =
                "6px 8px";

              kickBtn.style.borderRadius =
                "8px";

              kickBtn.style.background =
                "rgba(255,77,103,0.10)";

              kickBtn.style.color =
                "#ff7183";

              kickBtn.style.cursor =
                "pointer";

              kickBtn.style.fontSize =
                "9px";

              kickBtn.onclick =
                async () => {

                  if (
                    !confirm(
                      `Kick ${user.nickname}?`
                    )
                  ) {

                    return;

                  }

                  await kickUser(
                    roomID,
                    user.uid,
                    user.nickname
                  );

                };

              item.appendChild(
                kickBtn
              );

            }


            liveUsersList.appendChild(
              item
            );


            const statusRef =
              ref(
                db,
                `status/${user.uid}`
              );

            statusUnsubscribers[
              user.uid
            ] =
              onValue(
                statusRef,
                statusSnap => {

                  const state =
                    statusSnap.exists()
                      ? statusSnap.val().state
                      : "offline";

                  updateStatusDot(
                    statusDot,
                    state
                  );

                }
              );

          }
        );

      }
    );

}


// =========================================================
// KICK USER
// =========================================================

async function kickUser(
  roomID,
  uid,
  nickname
) {

  const blockedRef =
    ref(
      db,
      `kicked/${roomID}/${uid}`
    );

  const alreadyBlocked =
    await get(
      blockedRef
    );

  if (
    alreadyBlocked.exists()
  ) {

    toast(
      "User is already blocked.",
      "error"
    );

    return;

  }

  await remove(
    ref(
      db,
      `members/${roomID}/${uid}`
    )
  );

  await set(
    blockedRef,
    true
  );

  await pushSystemMessage(
    roomID,
    `<strong>${escapeHTML(nickname)}</strong> was kicked by <strong style="color:#ff6578">${escapeHTML(userNameDisplay.innerText)}</strong>`
  );

  toast(
    `${nickname} was kicked.`,
    "success"
  );

}


// =========================================================
// BLOCKED USERS
// =========================================================

async function openKickBlockModal(
  roomID
) {

  const snap =
    await get(
      ref(
        db,
        `kicked/${roomID}`
      )
    );

  const blocked =
    snap.exists()
      ? snap.val()
      : {};

  if (
    Object.keys(blocked).length ===
    0
  ) {

    toast(
      "No blocked users.",
      "success"
    );

    return;

  }

  const modal =
    document.createElement(
      "div"
    );

  modal.style.position =
    "fixed";

  modal.style.inset =
    "0";

  modal.style.zIndex =
    "12000";

  modal.style.background =
    "rgba(0,0,0,0.65)";

  modal.style.backdropFilter =
    "blur(8px)";

  modal.style.display =
    "flex";

  modal.style.alignItems =
    "center";

  modal.style.justifyContent =
    "center";

  modal.style.padding =
    "20px";


  const box =
    document.createElement(
      "div"
    );

  box.style.width =
    "min(400px,100%)";

  box.style.maxHeight =
    "75vh";

  box.style.overflowY =
    "auto";

  box.style.background =
    "#10171f";

  box.style.border =
    "1px solid rgba(255,255,255,0.08)";

  box.style.borderRadius =
    "18px";

  box.style.padding =
    "18px";

  box.style.boxShadow =
    "0 30px 80px rgba(0,0,0,.55)";


  const title =
    document.createElement(
      "h3"
    );

  title.textContent =
    "Blocked Users";

  title.style.marginBottom =
    "15px";


  box.appendChild(
    title
  );


  for (
    const uid of Object.keys(
      blocked
    )
  ) {

    let user =
      usersCache[uid];

    if (!user) {

      const userSnap =
        await get(
          ref(
            db,
            `users/${uid}`
          )
        );

      user =
        userSnap.exists()
          ? userSnap.val()
          : {
              nickname:
                "User",

              photoURL:
                DEFAULT_AVATAR
            };

      usersCache[uid] =
        user;

    }

    const row =
      document.createElement(
        "div"
      );

    row.style.display =
      "flex";

    row.style.alignItems =
      "center";

    row.style.gap =
      "9px";

    row.style.padding =
      "9px";

    row.style.marginBottom =
      "6px";

    row.style.borderRadius =
      "10px";

    row.style.background =
      "rgba(255,255,255,0.035)";


    const img =
      document.createElement(
        "img"
      );

    img.src =
      user.photoURL ||
      DEFAULT_AVATAR;

    img.style.width =
      "34px";

    img.style.height =
      "34px";

    img.style.borderRadius =
      "50%";

    img.style.objectFit =
      "cover";


    const name =
      document.createElement(
        "span"
      );

    name.textContent =
      user.nickname ||
      "User";

    name.style.flex =
      "1";

    name.style.fontSize =
      "11px";


    const unblock =
      document.createElement(
        "button"
      );

    unblock.textContent =
      "Unblock";

    unblock.style.padding =
      "6px 9px";

    unblock.style.borderRadius =
      "8px";

    unblock.style.background =
      "rgba(37,211,102,0.1)";

    unblock.style.color =
      "#62e494";

    unblock.style.cursor =
      "pointer";

    unblock.style.fontSize =
      "9px";


    unblock.onclick =
      async () => {

        await remove(
          ref(
            db,
            `kicked/${roomID}/${uid}`
          )
        );

        row.remove();

        toast(
          `${user.nickname} unblocked.`,
          "success"
        );

      };


    row.appendChild(
      img
    );

    row.appendChild(
      name
    );

    row.appendChild(
      unblock
    );

    box.appendChild(
      row
    );

  }


  const close =
    document.createElement(
      "button"
    );

  close.textContent =
    "Close";

  close.style.width =
    "100%";

  close.style.marginTop =
    "8px";

  close.style.padding =
    "10px";

  close.style.borderRadius =
    "10px";

  close.style.background =
    "rgba(255,255,255,0.06)";

  close.style.color =
    "white";

  close.style.cursor =
    "pointer";


  close.onclick =
    () => modal.remove();


  box.appendChild(
    close
  );

  modal.appendChild(
    box
  );

  document.body.appendChild(
    modal
  );

}


// =========================================================
// LISTEN FOR KICK
// =========================================================

let kickListeners = [];


async function listenForKick(
  roomID
) {

  kickListeners.forEach(
    unsubscribe => {

      if (unsubscribe)
        unsubscribe();

    }
  );

  kickListeners =
    [];


  const memberRef =
    ref(
      db,
      `members/${roomID}/${currentUser.uid}`
    );

  const kickedRef =
    ref(
      db,
      `kicked/${roomID}/${currentUser.uid}`
    );


  const handleKick =
    async () => {

      if (
        activeRoom !== roomID
      ) {

        return;

      }

      activeRoom =
        null;

      localStorage.removeItem(
        "activeRoom"
      );

      clearUI();

      toast(
        "You were removed from this room.",
        "error"
      );

      loadRooms();

    };


  kickListeners.push(
    onValue(
      memberRef,
      snap => {

        if (
          !snap.exists() &&
          activeRoom === roomID
        ) {

          handleKick();

        }

      }
    )
  );


  kickListeners.push(
    onValue(
      kickedRef,
      snap => {

        if (
          snap.exists() &&
          activeRoom === roomID
        ) {

          handleKick();

        }

      }
    )
  );

}


// =========================================================
// CLEAR UI
// =========================================================

function clearUI() {

  activeRoom =
    null;

  activeRoomCreator =
    null;

  localStorage.removeItem(
    "activeRoom"
  );

  if (messagesListener) {

    messagesListener();

    messagesListener =
      null;

  }

  if (typingListener) {

    typingListener();

    typingListener =
      null;

  }

  if (usersPanelUnsub) {

    usersPanelUnsub();

    usersPanelUnsub =
      null;

  }

  messagesEl.innerHTML =
    "";

  emptyChatState.classList.remove(
    "hidden"
  );

  chatContent.classList.add(
    "hidden"
  );

  usersPanelMenu.classList.remove(
    "open"
  );

  roomInfoWrapper.classList.remove(
    "open"
  );

  roomInfoOpen =
    false;

  cancelReply();

  hideTypingIndicator();

  loadRooms();

}


// =========================================================
// ROOM CLEANUP
// =========================================================

async function cleanupOldRooms() {

  try {

    const snap =
      await get(
        ref(
          db,
          "rooms"
        )
      );

    if (!snap.exists()) return;

    const now =
      Date.now();

    snap.forEach(
      async roomSnap => {

        const room =
          roomSnap.val();

        if (
          !room.createdAt
        ) return;

        if (
          now -
          room.createdAt >
          MAX_ROOM_AGE
        ) {

          const roomID =
            roomSnap.key;

          await remove(
            ref(
              db,
              `rooms/${roomID}`
            )
          );

          await remove(
            ref(
              db,
              `members/${roomID}`
            )
          );

          await remove(
            ref(
              db,
              `messages/${roomID}`
            )
          );

          await remove(
            ref(
              db,
              `typing/${roomID}`
            )
          );

          await remove(
            ref(
              db,
              `kicked/${roomID}`
            )
          );

          if (
            activeRoom ===
            roomID
          ) {

            clearUI();

          }

          console.log(
            "Deleted expired room:",
            roomID
          );

        }

      }
    );

  } catch (error) {

    console.error(
      "Room cleanup error:",
      error
    );

  }

}


setInterval(
  cleanupOldRooms,
  60 * 60 * 1000
);


// =========================================================
// MOBILE ROOMS
// =========================================================

mobileRoomsBtn.onclick =
  () => {

    if (
      mobileRoomsOpen
    ) {

      closeMobileRooms();

    } else {

      sidebar.classList.add(
        "mobile-open"
      );

      mobileRoomsOpen =
        true;

    }

  };


function closeMobileRooms() {

  sidebar.classList.remove(
    "mobile-open"
  );

  mobileRoomsOpen =
    false;

}


// Close sidebar when clicking chat on mobile
chat.addEventListener(
  "click",
  () => {

    if (
      window.innerWidth <= 720 &&
      mobileRoomsOpen
    ) {

      closeMobileRooms();

    }

  }
);


// =========================================================
// GLOBAL MENU CLOSING
// =========================================================

document.addEventListener(
  "click",
  event => {

    if (
      openMenu &&
      !openMenu.contains(
        event.target
      )
    ) {

      openMenu.remove();

      openMenu =
        null;

    }

  }
);


// =========================================================
// WINDOW LOAD
// =========================================================

window.addEventListener(
  "load",
  async () => {

    if (!currentUser) return;

    if (!activeRoom) return;

    try {

      const snap =
        await get(
          ref(
            db,
            `rooms/${activeRoom}`
          )
        );

      if (
        snap.exists()
      ) {

        const member =
          await get(
            ref(
              db,
              `members/${activeRoom}/${currentUser.uid}`
            )
          );

        if (
          member.exists()
        ) {

          await openRoom(
            activeRoom
          );

        }

      }

    } catch (error) {

      console.error(
        error
      );

    }

  }
);


// =========================================================
// INITIAL UI
// =========================================================

usersPanelBtn.style.display =
  "none";

mainScreen.style.display =
  "flex";


// =========================================================
// DONE
// =========================================================
