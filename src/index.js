import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCU65xjjRH77l6tAQk1hIvHVUXF2KG7rvE',
  authDomain: 'fir-tutorial-7ce4b.firebaseapp.com',
  projectId: 'fir-tutorial-7ce4b',
  storageBucket: 'fir-tutorial-7ce4b.appspot.com',
  messagingSenderId: '1044075365811',
  appId: '1:1044075365811:web:00a538c3b4faa13372f7c6',
};
//------------initialize the app
initializeApp(firebaseConfig);
// -----------initialize the service
const db = getFirestore();

//collection refrence
const colRef = collection(db, 'chats');
// -------------the chatroom class-----------------
//1.add new chat document
//2.set up a real time listener to add new chats
//3.update username
//4.update the room
class Chatroom {
  constructor(room, username) {
    this.room = room;
    this.username = username;
    this.chats = colRef; // refrence to all the chats collection in the firebase data base
    this.unsub;
  }
  // async addChat
  async addChat(message) {
    const now = new Date();
    const chat = {
      message: message,
      username: this.username,
      room: this.room,
      created_at: Timestamp.fromDate(now),
    }; // save the chat into the firestore database
    const response = await addDoc(colRef, chat);
    console.log(response);
    return response;
  }
  //----setting up a real time listener for the chats document such that whenever there is a modification of any kind there is an instant update
  getChat(callback) {
    //-- setting up a complex query so that chat in a specified room can be called
    const q = query(
      colRef,
      where('room', '==', this.room),
      orderBy('created_at')
    );
    this.unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === `added`) {
          callback(change.doc.data()); //this is the point where i will like to update the ui so the *callback* parameter will be a function that can render ui to the dom
        }
      });
    });
  }
  updateName(username) {
    this.username = username;
    localStorage.setItem(`username`, username);
  }
  updateRoom(room) {
    this.room = room;
    console.log(`room updated`);
    if (this.unsub()) {
      this.unsub();
    }
  }
}

///////////----------------ui.js------------------///////////

//dom queries
const chatList = document.querySelector(`.chat-list`);
const newChatform = document.querySelector(`.new-chat`);
const newNameform = document.querySelector(`.new-name`);
const updateMssg = document.querySelector(`.update-mssg`);
const rooms = document.querySelector(`.chat-rooms`);
class ChatUI {
  constructor(list) {
    this.list = list;
  }
  // help to clear out the innerHTML of any html element passed into it
  clear() {
    this.list.innerHTML = ``;
  }
  // this function takes in any data and output it in the format given below
  render(data) {
    const when = dateFns.distanceInWordsToNow(data.created_at.toDate(), {
      addSuffix: true,
    });
    const html = `<li class="list-group-item">
      <span class="username font-weight-bold">${data.username}</span>
      <span class="message">${data.message}</span>
      <div class="time">${when}</div>
    </li>`;
    this.list.innerHTML += html;
  }
}
//////////----------------app.js(connects between the two apps)--------------////////////

newChatform.addEventListener(`submit`, (e) => {
  e.preventDefault();
  const message = newChatform.message.value.trim();
  chatroom
    .addChat(message) // add message to the message property of the chats document stored in the firebase
    .then(() => {
      newChatform.reset();
    })
    .catch((err) => {
      console.log(err);
    });
});
newNameform.addEventListener(`submit`, (e) => {
  e.preventDefault();
  const newName = newNameform.name.value.trim();
  chatroom.updateName(newName);
  newNameform.reset();
  updateMssg.innerText = `your name has been updated to ${newName}`;
  setTimeout(() => {
    updateMssg.innerText = '';
  }, 3000);
});

// if the value stored in the local storage exist the username has a value of local storage item
const username = localStorage.username ? localStorage.username : `anonymous`; // ternary operators
const chatroom = new Chatroom(`general`, username);
const chatUI = new ChatUI(chatList);

// get the chat and render to the dom
chatroom.getChat((data) => {
  return chatUI.render(data);
  // console.log(data);
});

// changing rooms
rooms.addEventListener(`click`, (e) => {
  // console.log(e);
  if (e.target.nodeName === `BUTTON`) {
    chatUI.clear();
    chatroom.updateRoom(e.target.getAttribute(`id`));
    chatroom.getChat((chat) => {
      chatUI.render(chat);
    });
  }
});
async function testing(message) {
  const now = new Date();
  const chat = {
    // message: message,
    // username: this.username,
    // room: this.room,
    created_at: Timestamp.fromDate(now),
  };
  // save the chat into the firestore database
  const response = await addDoc(colRef, chat);
  // console.log(response);
  return response;
}
testing()
  .then((data) => console.log(data))
  .catch((err) => {
    console.log(err);
  });
