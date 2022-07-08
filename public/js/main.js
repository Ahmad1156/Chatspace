const socket=io();
const chatMessage=document.querySelector(".chat-messages");
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');

const {username,room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

socket.emit("joinRoom",{username,room});
//getting message from server
socket.on("message",(message)=>{

   outputMessage(message);
   
   //scroll down automatically
   chatMessage.scrollTop=chatMessage.scrollHeight;
});
 socket.on("roomUsers",({room,users})=>{
     outputRoomName(room);
     outputUsers(users);
 })
let chatForm=document.getElementById("chat-form");

chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    //get message
    const msg=e.target.elements.msg.value
    //Emit message to server

    socket.emit("chatMessage",msg);
    //clear All elements
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
});

function outputMessage(message){
    let div =document.createElement('div');
    div.classList.add("message");
    div.innerHTML=`	<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
       ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div);
}
//Add room name to Dom
function  outputRoomName(room){
    roomName.innerText=room;
} 
//Add users to dom
function outputUsers(users){
    userList.innerHTML=`
    ${users.map(user=>`<li>${user.username}</li>`).join('')}`;
}