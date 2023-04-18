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
  const basePath = await peertubeHelpers.getBaseRouterRoute();

  registerHook({
    target:   'action:auth-user.information-loaded',
    handler: async ({user}) => {
      console.log("user data for logged in user",user,client);
      if (client){
        let fullName = client.credentials.userId
        if (fullName){
          let nameEnd = fullName.indexOf(':');
          let clientName = fullName.substring(1,nameEnd);
          console.log("███ client exists already when initializing account",client.credentials.userId,client.isGuestAccount,clientName,user.userName);
          if (user.userName != clientName){
            console.log(">>>>>Names do not match<<<<<");
            //await client.logout();
            client=undefined;
          }
        }
      }
      if (!client){
        let userApi = peertubeHelpers.getBaseRouterRoute()+"/getmatrixuser?account=errhead";
        console.log("api call to get matrix user data",userApi);
        try {
          let userData =await axios.get(userApi, { headers: await peertubeHelpers.getAuthHeader() });
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
          console.log(client,user.account.displayName);
          client.setDisplayName(user.account.displayName);
          client.setRoomTopic('just testing for error message response');
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
      var test = document.getElementById('matrix-container');
      if (test){
        return;
      }
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
      console.log("44444",roomId,client);
      let addSpot = document.getElementById('plugin-placeholder-player-next');

      if (client && roomId) {
        console.log("creating chat room html");
        let buttonHTML = `<label id ="matrixchatlabel" style="color:white;">`+video.channel.displayName+` chat</label>`;
        buttonHTML = buttonHTML + ` <button id = "closematrixchat"  class="orange-button ng-star-inserted" style="float:right;" title="close chat panel">` + "❌" + `</button>`

        buttonHTML = buttonHTML + ` <button id = "matrixsettingsbutton"  class="orange-button ng-star-inserted" style="float:right;" title="Matrix Chat settings">` + "⚙" + `</button>`
        buttonHTML = buttonHTML + ` <button id = "matrixlinkbutton"  class="orange-button ng-star-inserted" style="float:right;" title="open chat in element">` + "🔗" + `</button>`
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
        let matrixSettingsButton = document.getElementById('matrixsettingsbutton');
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
            console.log("room.timeline event",event,"now the event event",event.event,"now the content",event.event.content);
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
            let fixedName =sender.split("(");
            sender =fixedName[0];
            let textHeader = `<img src="`+avatar+`" width="24" height="24" style="border-radius:50%;"><b> `+sender+"</b> ";
            if (event.event.content.msgtype === 'm.image'){
              let picture = client.mxcUrlToHttp(event.event.content.url,24,24, 'scale');
              let link = client.mxcUrlToHttp(event.event.content.url);
              text = textHeader+":"+`<a href="`+link+`" target="_blank" rel="noopener noreferrer"><img src="`+picture+`" ></a>`;
            } else {
              if (event.event.content.formatted_body){
                text = event.event.content.formatted_body;
              } else {
                text = message.replace(new RegExp('\r?\n','g'), '<br />');
                
              }
              if (text.indexOf("blockquote")>0){
                console.log ("pre-text",text);
                text = text.replace(/<br>/g,"<br>>");
                text = text.replace(/<br\/>/g,"<br>>");
                console.log("post-text",text);           
                textHeader = `<span style="color:white">`+textHeader+`</span>`
                textHeader = `<blockquote style="color:green;font-style:italic">`+textHeader;
                text = text.replace(/<blockquote>/,textHeader);
              } else {
                text = `<img src="`+avatar+`" width="24" height="24" style="border-radius:50%;"><b> `+sender+":</b> "+text;
              }
            }
            let messageElement=document.createElement('div');
            messageElement.class="message";
            messageElement.innerHTML = text;
            previousHeight = chatMessages.offsetHeight;
            chatMessages.prepend(messageElement);
            if (chatMessages.offsetHeight>maxHeight){
              chatMessages.style.Height = maxHeight+'px';
            }
          }
       });
      } else {
        console.log ("not creating room html",roomId,client);
      }
      if (matrixSettingsButton){
        matrixSettingsButton.onclick = async function () {
          console.log("this",this);
          let inviteApi = peertubeHelpers.getBaseRouterRoute()+"/sendinvite?room="+roomId+"&user="+encodeURIComponent("@errhead:matrix.org");
          try {
            let result = await axios.get(inviteApi);
            console.log("result",result);
          } catch (err) {
            console.log("error sending invite",inviteApi,err);
          }


        }
      }
      if (matrixLinkButton){
        matrixLinkButton.onclick = async function () {
          let roomLink ="https://matrix.to/#/"+roomId;
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
  registerHook({
    target:   'action:auth-user.logged-out',
    handler: async () => {
      console.log("user data for logged in user",client);
      if (client){
        client=undefined;
      }
    }
  })
  registerHook({
    target: 'action:video-channel-update.video-channel.loaded',
    handler: async () => {
      let channelUpdate = document.getElementsByClassName("form-group");
      let channel = (window.location.href).split("/").pop();
      let chatApi = peertubeHelpers.getBaseRouterRoute()+"/getchatroom?channel="+channel;
      let roomId;
      console.log("matrix chatroom request api",chatApi);
      try {
        let roomIdData =await axios.get(chatApi, { headers: await peertubeHelpers.getAuthHeader() });
        roomId = roomIdData.data;
        console.log("matrix chatroom id ",roomId);
      } catch (err){
        console.log("error attempting to fetch matrix chat room id",chatApi,err);
      }

      let panel = document.createElement('div');
      panel.setAttribute('class', 'matrix-panel');
      panel.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms')
      let html = "<br> Matrix Chatroom ID:";
      html = html + `<input STYLE="color: #000000; background-color: #ffffff;"type="text" id="matrix-chatroom" name="Matrix-chatroom" value="` + roomId + `">`
      html = html + `<button type="button" id="update-matrix-chat" name="update-matrix-chat" class="peertube-button orange-button ng-star-inserted">Save</button>`

      console.log("matrix html",html);
      panel.innerHTML = html;
      channelUpdate[0].appendChild(panel);
      let chatRoom = document.getElementById("matrix-chatroom");
      let chatButton = document.getElementById("update-matrix-chat");
      if (chatButton) {
        chatButton.onclick = async function () {
          let chatApi = basePath + "/setchatroom?channel=" + channel + "&chatroom=" + encodeURIComponent(chatRoom.value);
          console.log("chat api",chatApi);
          try {
            await axios.get(chatApi, { headers: await peertubeHelpers.getAuthHeader() });
          } catch (err) {
            console.log("error attempting to set chatroom", err, channel, chatRoom);
          }
          chatButton.innerText = "Saved!";
        }
      }
    }
  })
}

export {
  register
}
