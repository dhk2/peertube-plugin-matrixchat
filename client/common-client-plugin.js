//const nostr = require('nostr-tools');
//import ('nostr-tools')
//import { NostrClient } from '@cmdcode/nostr-utils'
//import { Nostr, Relay } from 'https://deno.land/x/nostr_deno_client/mod.ts';
//import { NostrProvider } from "nostr-react";
//const {RelayPool} = require('nostr')
//import irc from 'slate-irc'
//import net from 'net'
import axios from 'axios';
import sdk from 'matrix-js-sdk';
async function register ({ registerHook, peertubeHelpers }) {
  console.log('Matrix Chat Initializing');
  let matrixUser,client;
  
  registerHook({
    target:   'action:auth-user.information-loaded',
    handler: async ({user}) => {
      console.log("user data for logged in user",user,client);
      if (client){
        let fullName = client.credentials.userId
        let nameEnd = fullName.indexOf(':');
        let clientName = fullName.substring(1,nameEnd);
        console.log("███ client exists already when initializing account",client.credentials.userId,client.isGuestAccount,clientName,user.userName);
        if (user.userName != clientName){
          console.log(">>>>>Names do not match<<<<<");
          //await client.logout();
          client=undefined;
        }
      }
      if (!client){
        let userApi = peertubeHelpers.getBaseRouterRoute()+"/getmatrixuser?account=errhead";
        console.log("api call to get matrix user data",userApi);
        try {
          let userData =await axios.get(userApi, { headers: peertubeHelpers.getAuthHeader() });
          matrixUser = userData.data;
          console.log("user data ",matrixUser);
          if (matrixUser){
            client = sdk.createClient(matrixUser);
          }
        } catch (err){
          console.log("error attempting to login",userApi,matrixUser,err);
        }
      } else {
        console.log("Client already instantiated",client);
      }
      if (client){
        //console.log("███ client exists",client.credentials.userId,client.isGuestAccount);
        client.startClient();
        client.once('sync', async function(state, prevState, res) {
          console.log("matrix state",state); // state will be 'PREPARED' when the client is ready to use
          let rooms = await client.getJoinedRooms();
          console.log("rooms user is a member of",rooms);
          console.log("client settings",client.avatar_url);
          console.log("peertube settings",user.account.avatars[0]);
          if (user.account.avatars[0]){
            const imageResponse = await axios.get(user.account.avatars[0].path, { responseType: 'arraybuffer' });
            const imageType = imageResponse.headers['content-type'];
            const uploadResponse = await client.uploadContent(imageResponse.data, { rawResponse: false, type: imageType });
            const matrixUrl = uploadResponse.content_uri;
            console.log(matrixUrl);
            await client.setAvatarUrl(matrixUrl);
            console.log("fixed",client.avatar_url);
          }
        })
      }
    }
  })
  registerHook({
    target: 'action:video-watch.player.loaded',
    handler: async ({ player, video }) => {
      let roomId,maxHeight,userToken;
      console.log("video metadata",video);
      let chatApi = peertubeHelpers.getBaseRouterRoute()+"/getchatroom?channel="+video.byVideoChannel;
      console.log("room request api",chatApi);
      try {
        let roomIdData =await axios.get(chatApi);
        roomId = roomIdData.data;
        console.log("chatroom id ",roomId);
      } catch (err){
        console.log("error attempting to fetch chat room id",chatApi,err);
      }
      
      if (!client && roomId && !peertubeHelpers.isLoggedIn()){
        console.log("creating guest user data",client,roomId,peertubeHelpers.isLoggedIn())
        let guestUserApi = peertubeHelpers.getBaseRouterRoute()+"/getmatrixuser?account=guest";
        console.log(guestUserApi);
        try {
          let userData =await axios.get(guestUserApi);
          matrixUser = userData.data;
          console.log("user data ",matrixUser);
          if (matrixUser){
            client = sdk.createClient(matrixUser);
          }
        } catch (err){
          console.log("error attempting to login",userApi,matrixUser,err);
        }
        if (client){
          client.startClient();
          client.once('sync', async function(state, prevState, res) {
            console.log("matrix state",state); // state will be 'PREPARED' when the client is ready to use
            let rooms = await client.getJoinedRooms();
            console.log("rooms user is a member of",rooms);
          });
         
        }
      }
      //userToken = 'lVZqe6L9S5UVowl5kn8t-AknuUjaXEyJg0H8HI3Kh3Q'
      console.log("111111",peertubeHelpers.getBaseStaticRoute(),peertubeHelpers.getBaseRouterRoute());
      console.log("2222222",peertubeHelpers.getBasePluginClientPath(),peertubeHelpers.isLoggedIn())
      console.log("3333333",peertubeHelpers.getAuthHeader);
      let addSpot = document.getElementById('plugin-placeholder-player-next');

      if (client && roomId) {
        let buttonHTML = `<label id ="matrixchatlabel" style="color:white;">`+video.channel.displayName+` chat</label>`;
        buttonHTML = buttonHTML + ` <button id = "closematrixchat"  class="orange-button ng-star-inserted" style="float:right;" title="close chat panel">` + "❌" + `</button>`

        buttonHTML = buttonHTML + ` <button id = "matrixsettingsbutton"  class="orange-button ng-star-inserted" style="float:right;" title="Matrix Chat settings">` + "⚙" + `</button>`
        buttonHTML = buttonHTML + ` <button id = "matrixlinkbutton"  class="orange-button ng-star-inserted" style="float:right;" title="open chat in telegram">` + "🔗" + `</button>`
        buttonHTML = buttonHTML + ` <button id = "openmatrixchat"  class="orange-button ng-star-inserted" style="float:right;" title="open chat panel">` +video.channel.displayName+ " chat" + `</button>`

        let titleBar=document.createElement('span');
        titleBar.innerHTML = buttonHTML;
        titleBar.style.display="block";
        
        let newContainer = document.createElement('div');
        newContainer.setAttribute('id','matrix-container')
        //newContainer.setAttribute('hidden', 'true');
        addSpot.append(newContainer)
        //addSpot.append()

        var container = document.getElementById('matrix-container')

        if (!container) {
          logger.error('Cant find matrix chat container.');
          return;
        }
        container.appendChild(titleBar);


        let chatWindow=document.createElement('span');
        chatWindow.setAttribute('id', 'matrix-chats')
        chatWindow.style.height='100%';
        chatWindow.style.width='100%';
        chatWindow.style.color='white';
        chatWindow.style.overflow = "auto";
        chatWindow.style.display = "flex";
        //chatWindow.style.resize = "both";
        chatWindow.style.flexDirection = "column-reverse";
        //chatWindow.style.text="000000";
       //chatWindow.innerHTML=`Matrix Chat`
        container.appendChild(chatWindow);
        let chatInput = document.createElement('div');
        chatInput.style.display="flex";
        chatInput.style.flexDirection="row";
        chatInput.innerHTML =`<input type="text" id="new-message" style="flex:1"/></div>`
      
        container.appendChild(chatInput);
        let videoHook=document.getElementById('videojs-wrapper');
        //console.log("vidoplayer data",videoHook);
        maxHeight = videoHook.offsetHeight
        container.style.height = maxHeight+'px';
        container.style.width = "100%";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.overflow = "auto";
        container.style.resize = "both";
      
        let chatMessages=document.getElementById("matrix-chats");
        let sendButton = document.getElementById('send-button');
        let inputBox = document.getElementById('new-message');
        let matrixSettingsButton = document.getElementById('bigchat');
        let matrixLinkButton = document.getElementById('matrixlinkbutton');
        let closeMatrixChat = document.getElementById('closematrixchat');
        let openMatrixChat = document.getElementById('openmatrixchat');
        openMatrixChat.hidden=true;
        let matrixChatLabel = document.getElementById('matrixchatlabel');
        let previousHeight = container.offsetHeight;
        if (client){
          await client.joinRoom(roomId)
          console.log("joining room",roomId);
          client.on("Room.timeline", async function(event, room, toStartOfTimeline) {
           // console.log("room.timeline",event);
            //if (room && room.roomId !="!ULdntgxAgvbNuXZQGu:matrix.org"){
              if (room && room.roomId !=roomId){
               // console.log("skipping",room.roomId,roomId);
                return;
              }
            let message = event.event.content.body;
            let text;
            if (message){
            let profile = await client.getProfileInfo(event.sender.userId);
            let avatar = client.mxcUrlToHttp(profile.avatar_url,8,8, 'scale');
            //console.log("avatar info",avatar, profile.avatar_url, );
            let sender = event.sender.name;
            if (event.event.content.msgtype === 'm.image'){
              let picture = client.mxcUrlToHttp(event.event.content.url,24,24, 'scale');
              let link = client.mxcUrlToHttp(event.event.content.url);
              text = `<a href="`+link+`" target="_blank" rel="noopener noreferrer"><img src="`+picture+`" ></a>`;
            } else {
              text = message;
            }
            let messageElement=document.createElement('div');
            messageElement.class="message";
            messageElement.innerHTML = `<img src="`+avatar+`" width="24" height="24" style="border-radius:50%;"><b> `+sender+":</b> "+text
            previousHeight = chatMessages.offsetHeight;
            //console.log("starting heights",previousHeight, chatMessages.offsetHeight,chatMessages.scrollHeight);
            chatMessages.prepend(messageElement);
            //console.log("changed heights",previousHeight, chatMessages.offsetHeight,chatMessages.scrollHeight);
            if (chatMessages.offsetHeight>maxHeight){
              chatMessages.style.Height = maxHeight+'px';
            }
            //console.log("fixed heights",previousHeight, chatMessages.offsetHeight,chatMessages.scrollHeight);
            //chatMessages.innerHTML=chatMessages.innerHTML+`<br><img src="`+avatar+`" width="24" height="24" style="border-radius:50%;"><b> `+sender+":</b> "+text;
           //console.log("room",room.roomId);
            //roomId = room.roomId;
          }
        
        });
      }
      if (matrixSettingsButton){
        matrixSettingsButton.onclick = async function () {
            console.log("this",this);

        }
      }
      if (matrixLinkButton){
        matrixLinkButton.onclick = async function () {
          let roomLink ="https://matrix.to/#/#p2ptube-"+video.byVideoChannel+":invidious.peertube.biz"
          window.open(roomLink, '_blank');

        }
      }
      if (inputBox){
        inputBox.addEventListener("keyup", function(event) {
          if (event.key === "Enter") {
            if (inputBox && inputBox.value){
              let text = inputBox.value;
              const content = {
                body: text,
                msgtype: "m.text"
              }
              client.sendEvent(roomId, "m.room.message", content, "", (err, res) => {
                console.log(err);
              });
              inputBox.value='';
            }
          }
        });
      }
      if (sendButton){
        sendButton.onclick = async function () {
          if (inputBox && inputBox.value){
            let text = inputBox.value;
            const content = {
              body: text,
              msgtype: "m.text"
            }
            client.sendEvent(roomId, "m.room.message", content, "", (err, res) => {
              console.log(err);
            });
            inputBox.value='';
          }
        }
      } 
      if (closeMatrixChat){
        closeMatrixChat.onclick = async function (){
          if (chatWindow){
            chatWindow.hidden=true;
          }
          if (inputBox){
            inputBox.hidden=true;
          }
          if (sendButton){
            sendButton.hidden=true;
          }
          
          openMatrixChat.hidden=false;
          console.log("height of button",this.offsetHeight);
          console.log("height of container",container.offsetHeight);
          previousHeight = container.offsetHeight;
          container.style.height = this.offsetHeight+'px'
          matrixChatLabel.hidden=true;
          this.hidden=true;
        }
      }
      if (openMatrixChat){
        openMatrixChat.onclick = async function (){
          if (chatWindow){
            chatWindow.hidden=false;
          }
          if (inputBox){
            inputBox.hidden=false;
          }
          if (sendButton){
            sendButton.hidden=false;
          }
          if (previousHeight<this.offsetHeight){
            let videoHook=document.getElementById('videojs-wrapper');
            previousHeight = videoHook.offsetHeight;
          }
          closeMatrixChat.hidden=false;
          console.log("height of button",this.offsetHeight);
          console.log("height of container",container.offsetHeight);
          container.style.height = previousHeight+'px'
          matrixChatLabel.hidden=false;
          this.hidden=true;
        }
      }
    }
    }
  })  
}

export {
  register
}
