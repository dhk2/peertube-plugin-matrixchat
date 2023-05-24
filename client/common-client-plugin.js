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
  let matrixUser,client,joinedRooms;
  const basePath = await peertubeHelpers.getBaseRouterRoute();
  const { notifier } = peertubeHelpers
  registerHook({
    target:   'action:auth-user.information-loaded',
    handler: async ({user}) => {
      console.log("user data for logged in user",user,client);
      if (client){
        let fullName = client.credentials.userId
        if (fullName){
          let nameEnd = fullName.indexOf(':');
          let clientName = fullName.substring(1,nameEnd);
          console.log("███ client exists already when initializing account",client.credentials.userId,client.isGuestAccount,clientName,user.username);
          if (user.username != clientName){
            console.log(">>>>>Names do not match<<<<<",user.username,client);
            //await client.logout();
            await client.stopClient();
            console.log("client after stopping",client);
            client = undefined
          }
        }
      }
      if (!client){
        let userApi = await peertubeHelpers.getBaseRouterRoute()+"/getmatrixuser";
        console.log("api call to get matrix user data",userApi);
        try {
          let userData =await axios.get(userApi, { headers: await peertubeHelpers.getAuthHeader() });
          matrixUser = userData.data;
          console.log("matrix user data ",matrixUser,client);
          if (matrixUser){
            console.log("**creating client**",matrixUser,client);
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
        console.log("**starting matrix client**",matrixUser,client);
        client.startClient();
        client.once('sync', async function(state, prevState, res) {
          console.log("matrix state",state); // state will be 'PREPARED' when the client is ready to use
          joinedRooms = await client.getJoinedRooms();
          console.log("rooms user is a member of",joinedRooms);
          let matrixAvatar = await client.getProfileInfo(matrixUser.userId,'avatar_url');
          console.log("client settings",matrixAvatar);
          console.log("peertube settings",user.account.avatars[0]);
          console.log(client,user.account.displayName);
          client.setDisplayName(user.account.displayName);
          //client.setRoomTopic('just testing for error message response');
          if (user.account.avatars[0]  && !matrixAvatar){
            const imageResponse = await axios.get(user.account.avatars[0].path, { responseType: 'arraybuffer' });
            const imageType = imageResponse.headers['content-type'];
            const uploadResponse = await client.uploadContent(imageResponse.data, { rawResponse: false, type: imageType });
            const matrixUrl = uploadResponse.content_uri;
            console.log(matrixUrl);
            await client.setAvatarUrl(matrixUrl);
            console.log("fixed",client.avatar_url);

          }
          let uuidFromUrl = (window.location.href).split("/").pop();
          console.log("theoretical video url", uuidFromUrl);
          let chatAddSpot = document.getElementById('plugin-placeholder-player-next');
          if (uuidFromUrl.length>20 && chatAddSpot){
            let videoInfo;
            try {
              let videoApi = "/api/v1/videos/"+uuidFromUrl;
              videoInfo = await axios.get(videoApi);
            } catch(err) {
              console.log("error attempting to get channel info",err);
            }
            console.log("videoInfo",videoInfo);

            if (videoInfo){
              let channel=videoInfo.data.channel.name;
              if (!videoInfo.data.channel.isLocal){
                channel=channel+'@'+videoInfo.data.channel.host;
              }
              console.log("channel to get chatroom for",channel,videoInfo.data.channel);
              
              let channelDisplay = videoInfo.data.channel.displayName;
              let chatCreateResult = createChat(channel,channelDisplay);
            } else {
              console.log("unable to get video info to determine channel for chat");
            }

          }
        })
      }
    }
  })
  registerHook({
    target : 'action:login.init',
    handler: async () => {
        if (client){
          await client.stopClient();
          client=undefined;
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
      let settings =await peertubeHelpers.getSettings();
      console.log("video metadata",video);
      if (video.isLive || settings['matrix-always']){
      let chatRoomResult = createChat(video.byVideoChannel,video.channel.displayName);
      }
    }
  })  
  registerHook({
    target:   'action:auth-user.logged-out',
    handler: async () => {
      console.log("user data for logged in user",client);
      if (client){
        await client.stopClient();
        client=undefined;
      }
    }
  })
  registerHook({
    target: 'action:video-channel-update.video-channel.loaded',
    handler: async (testy,toasty) => {
      console.log("testing feed into video channel update",testy,toasty);
      let channelUpdate = document.getElementsByClassName("form-group");
      let channel = (window.location.href).split("/").pop();
      let chatApi = peertubeHelpers.getBaseRouterRoute()+"/getchatroom?channel="+encodeURIComponent(channel);
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
      let html;
      html = "<hr><b> Matrix Chatroom ID:</b><br>";
      html = html + `<input STYLE="color: #000000; background-color: #ffffff;"type="text" id="matrix-chatroom" name="Matrix-chatroom" value="` + roomId + `" title = "Set matrix chat room ID, can be configured by specifying room ID (!2tP8BSJVwZSfeEF5:invidious.peertube.biz) or alias (#p2ptube-dbz:invidious.peertube.biz)" size="42">`
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
            let roomResult = await axios.get(chatApi, { headers: await peertubeHelpers.getAuthHeader() });
            console.log(roomResult);
            chatRoom.value=roomResult.data;
            notifier.success("successfully set chatroom to " + roomResult.data);
          } catch (err) {
            let errorMessage="unspecified error ";
            if (err && err.response){
              errorMessage = err.response.data+" ";
            }
            notifier.error(errorMessage+chatRoom.value);
            console.log("error attempting to set chatroom", errorMessage, channel, chatRoom.value);
          }
        }
      }
    }
  })
  async function createChat(channelName,channelDisplay){
    console.log("channel to create chat for", channelName);
    let chatApi = peertubeHelpers.getBaseRouterRoute()+"/getchatroom?channel="+channelName;
    let roomId,maxHeight,userToken;
    console.log("room request api",chatApi);
    try {
      let roomIdData =await axios.get(chatApi,{ headers: await peertubeHelpers.getAuthHeader() });
      roomId = roomIdData.data;
      console.log("matrix chatroom id ",roomId);
    } catch (err){
      console.log("error attempting to fetch matrix chat room id",chatApi,err);
    }
    
    if (!client && roomId && !peertubeHelpers.isLoggedIn()){
      console.log("creating guest user data",client,roomId,peertubeHelpers.isLoggedIn())
      let guestUserApi = peertubeHelpers.getBaseRouterRoute()+"/getmatrixuser?anon=true";
      console.log(guestUserApi);
      try {
        let userData =await axios.get(guestUserApi);
        matrixUser = userData.data;
        console.log("matrix guest user data ",matrixUser,client);
        if (matrixUser){
          console.log("**creating client**",matrixUser,client);
          client = sdk.createClient(matrixUser);
        }
      } catch (err){
        console.log("error attempting guest login to matrix",guestUserApi,matrixUser);
      }
      if (client){
        console.log("**starting client**",matrixUser,client);
        client.startClient();
        client.once('sync', async function(state, prevState, res) {
          console.log("Matrix state",state); // state will be 'PREPARED' when the client is ready to use
          joinedRooms = await client.getJoinedRooms();
          console.log("Matrix rooms user is a member of",joinedRooms);
        });
      }
    }
    //userToken = 'lVZqe6L9S5UVowl5kn8t-AknuUjaXEyJg0H8HI3Kh3Q'
    //console.log("111111",await peertubeHelpers.getBaseStaticRoute(),peertubeHelpers.getBaseRouterRoute());
    //console.log("2222222",await peertubeHelpers.getBasePluginClientPath(),peertubeHelpers.isLoggedIn())
    //console.log("3333333",await peertubeHelpers.getAuthHeader);
    //console.log("44444",roomId,client);
    let addSpot = document.getElementById('plugin-placeholder-player-next');
    if (client && roomId && addSpot) {
      if (joinedRooms && joinedRooms.joined_rooms.includes(roomId)){
        console.log("already member of room",roomId);
      } else {
        let inviteResult;
        
        let inviteApi = peertubeHelpers.getBaseRouterRoute()+"/sendinvite?room="+encodeURIComponent(roomId)+"&user="+encodeURIComponent(matrixUser.userId);
        let channelParts = channelName.split("@");
        if (channelParts.length>1){
          inviteApi = inviteApi+"&instance="+channelParts[1];
        }
        try {
          inviteResult = await axios.get(inviteApi);
          console.log("invite result",inviteResult);
        } catch (err) {
          console.log("error sending invite",inviteApi,err);
        }
      }
      console.log("joining room",roomId,matrixUser);
      try {
        await client.joinRoom(roomId)
      } catch (err){
        console.log("failed joining room",roomId,err);
        return;
      }
      console.log("creating chat room html");
      let buttonHTML = `<label id ="matrixchatlabel" style="color:white;">`+channelDisplay+` chat</label>`;
      buttonHTML = buttonHTML + ` <button id = "closematrixchat"  class="orange-button ng-star-inserted" style="float:right;" title="close chat panel">` + "❌" + `</button>`
      buttonHTML = buttonHTML + ` <button id = "matrixsettingsbutton"  class="orange-button ng-star-inserted" style="float:right;" title="Matrix Chat settings">` + "⚙" + `</button>`
      buttonHTML = buttonHTML + ` <button id = "matrixlinkbutton"  class="orange-button ng-star-inserted" style="float:right;" title="open chat in element">` + "🔗" + `</button>`
      buttonHTML = buttonHTML + ` <button id = "openmatrixchat"  class="orange-button ng-star-inserted" style="float:right;" title="open chat panel">` +channelDisplay+ " chat" + `</button>`
      let titleBar=document.createElement('span');
      titleBar.innerHTML = buttonHTML;
      titleBar.style.display="block";
      var test = document.getElementById('matrix-container');
      if (test){
        return;
      }
      let newContainer = document.createElement('div');
      newContainer.setAttribute('id','matrix-container')
      //newContainer.setAttribute('hidden', 'true');
      addSpot.append(newContainer)
      //addSpot.append()

      var container =document.getElementById('matrix-container')

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

        client.on("Room.timeline", async function(event, room, toStartOfTimeline) {
          //console.log("room.timeline event",event,"now the event event",event.event,"now the content",event.event.content);
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
      }
      if (matrixSettingsButton){
        let matrixInviteButton,matrixUpdateButton,matrixUserList,matrixBanButton,matrixAdminButton;
        matrixSettingsButton.onclick = async function () { 
          //console.log("client",client);
          //console.log("store",client.store);
          //console.log("rooms",client.store.rooms);
          console.log("members",client.store.rooms[roomId].currentState.members);
          console.log("members",client.store.rooms[roomId].currentState.members[matrixUser.userId]);
          if (matrixUser && client.store.rooms[roomId].currentState.members[matrixUser.userId].powerLevel==100){
            console.log(matrixUser.userId,"is an admin");
          }
          /*
          console.log("this",this);
          let inviteApi = peertubeHelpers.getBaseRouterRoute()+"/sendinvite?room="+roomId+"&user="+encodeURIComponent("@errhead:matrix.org");
          try {
            let result = await axios.get(inviteApi);
            console.log("result",result);
          } catch (err) {
            console.log("error sending invite",inviteApi,err);
          }
          */
              await peertubeHelpers.showModal({
              title: 'Matrix Options ',
              content: ` `,
              close: true,
              confirm: { value: 'X', id: 'matrixoptionsclose', action: () => { } },
            });
            let html = `You can invite your existing Matrix account to the chat room to easily access it from your client of choice. You can specify the matrix account in the format: @don:invidious.peertube.biz`;
            html = html + `<br><label for="matrixinvite">address to invite:</label><input style="color: #000000; background-color: #ffffff;"  type="text" id="matrixinvite" title = "the @ symbol followed by the user name, then a colon and the Matrix Server the account resides on." placeholder = "@user:server.com">`;
            html =html +`<button class="peertube-button orange-button ng-star-inserted" id="sendinvite">Send Invite</button>`;
           
            //html = html + `<hr>  <input type="checkbox" id="customaddress" name="customaddress">`;
            html = html+"<hr>";
            //html = html + `<label for="customaddress"> Specify user address</label><br>`;
            html = html + `You can specify an external matrix account to use for PeerTube by setting the following parameters. Depending on server configuration either password or token should work.<br>`
            html = html + `<label for="address">Matrix Address:</label><input style="color: #000000; background-color: #ffffff;"  type="text" id="matrixaddress" placeholder = "@user:server.com" >`;
            html = html + `<br><label for="address">Token:</label><input style="color: #000000; background-color: #ffffff;"  type="text" id="matrixtoken" >`;
            html = html + `<br><label for="address">Password:</label><input style="color: #000000; background-color: #ffffff;"  type="text" id="matrixpassword" >`;
            html =html +`<br><button class="peertube-button orange-button ng-star-inserted" id="updatematrixaccount">Set Matrix Account</button>`;
            if (matrixUser && client.store.rooms[roomId].currentState.members[matrixUser.userId].powerLevel==100){
              console.log(matrixUser.userId,"is an admin");
              html = html + `<hr>User Levels<br>`;
              html = html +`<select id="matrixuserlist"><Option value="" >Chatters</option></select><br>`;
              //html = html + `<input style="color: #000000; background-color: #ffffff;"  type="text" id="matrixedit"><br>`;
              html =html +`<button class="peertube-button orange-button ng-star-inserted" id="matrixadminbutton">Make Admin</button>`;
              html =html +`<button class="peertube-button orange-button ng-star-inserted" id="matrixbanbutton">Remove Admin</button>`;
            }           
            let modal = (document.getElementsByClassName('modal-body'))
            modal[0].setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms')
            modal[0].innerHTML = html;
            matrixInviteButton= document.getElementById('sendinvite');
            matrixUpdateButton= document.getElementById('updatematrixaccount');
            matrixUserList = document.getElementById('matrixuserlist');
            matrixAdminButton = document.getElementById('matrixadminbutton');
            matrixBanButton = document.getElementById('matrixbanbutton');
            if (matrixInviteButton){
              matrixInviteButton.onclick = async function () {
                let invitee = document.getElementById('matrixinvite');
                let inviteResult;
                if (invitee) {
                  let inviteApi = peertubeHelpers.getBaseRouterRoute()+"/sendinvite?room="+roomId+"&user="+encodeURIComponent(invitee.value);
                  try {
                    inviteResult = await axios.get(inviteApi);
                    console.log("invite result",inviteResult);
                  } catch (err) {
                    console.log("error sending invite",inviteApi,err);
                  }
                  if (inviteResult && inviteResult.status){
                    if (inviteResult.status == 200){
                      notifier.success("successfully sent invite");
                    } else {
                      notifier.error (inviteResult.statusText);
                    }
                  }
                }
              }
            }
            if (matrixUpdateButton){
              matrixUpdateButton.onclick  = async function () {
                let newMatrixUser = {};
                let baseUrl;
                let matrixAddress= document.getElementById('matrixaddress');
                let matrixToken= document.getElementById('matrixtoken');
                let matrixPassword= document.getElementById('matrixpassword');
                if (matrixAddress.value){
                  let parts = matrixAddress.value.split(":");
                  if (parts.length>1){
                    newMatrixUser.baseUrl= "https://"+parts[1];
                  } else {
                    console.log("unable to find server in address",matrixAddress.value);
                    return;
                  }
                  if (matrixAddress.value.indexOf('@') != 0){
                    console.log("first character of user name should be @",matrixAddress.value.indexOf('@'));
                    return;
                  }
                }
                if (!matrixToken.value && !matrixPassword.value){
                  console.log("no authentication method entered");
                  return;
                }
                newMatrixUser.userId = matrixAddress.value;
                if (matrixToken.value){
                  newMatrixUser.accessToken = matrixToken.value;
                }
                if (matrixPassword.value && (matrixPassword.value.length>1)){
                  newMatrixUser.password = matrixPassword.value;
                }
                let setUserApi = peertubeHelpers.getBaseRouterRoute()+"/setmatrixuser";
                let setResult;
                try {
                  setResult = await axios.post(setUserApi,newMatrixUser,{ headers: await peertubeHelpers.getAuthHeader() });
                  console.log("set user result",setResult);
                } catch (err) {
                  console.log("error setting matrix account settings",setUserApi,err);
                }
                if (setResult && setResult.status){
                  if (setResult.status == 200){
                    notifier.success("successfully updated account settings, logout and log back in");
                  } else {
                    notifier.error (setResult.statusText);
                  }
                }
              }
            }
            if (matrixUserList){
              let allUsers = client.store.rooms[roomId].currentState.members;
              console.log("all users",allUsers,allUsers.length);
              for (const user in allUsers){
                let userChoice = document.createElement("option");
                userChoice.text = user;
                //userChoice.value = user;
                console.log("adding ",user,userChoice);
                matrixUserList.add(userChoice);
              }
              matrixUserList.addEventListener('change', function() {
                console.log('You selected: ', this.value);
                let allUsers = client.store.rooms[roomId].currentState.members;
                console.log("selected ",matrixUserList.selectedIndex, matrixUserList[matrixUserList.selectedIndex].value);
                let targetUserId = this.value;
                console.log("target user",allUsers[targetUserId]);
                let powerLevel = allUsers[targetUserId].powerLevel;
                if (powerLevel ==100){
                  console.log("full admin");
                  matrixAdminButton.style.visibility="hidden";
                  matrixBanButton.style.visibility="hidden";
                }
                if (powerLevel>0 && powerLevel <100){
                  console.log("admin");
                  matrixAdminButton.style.visibility="hidden";
                  matrixBanButton.style.visibility="visible";
                }

               if (powerLevel == 0){
                  console.log("user");
                  matrixAdminButton.style.visibility="visible";
                  matrixBanButton.style.visibility="hidden";
                }
              });
            }
            if (matrixAdminButton){
              matrixAdminButton.onclick  = async function () {
                let allUsers = client.store.rooms[roomId].currentState.members;
                console.log("admin button for ",matrixUserList.selectedIndex, matrixUserList[matrixUserList.selectedIndex].value);
                let targetUserId = matrixUserList[matrixUserList.selectedIndex].value;
                console.log("target user",allUsers[targetUserId]);
                console.log("acting user",allUsers[matrixUser.userId]);

                const powerLevelEvent = client.store.rooms[roomId].currentState.getStateEvents('m.room.power_levels', '');
                try {
                  let changeResult = await client.setPowerLevel(roomId,targetUserId,69,powerLevelEvent);
                  notifier.success("successfully made "+targetUserId+" room admin for "+roomId);
                  matrixAdminButton.style.visibility="hidden";
                  matrixBanButton.style.visibility="visible";
                } catch {
                  notifier.error("failed to make "+targetUserId+" room admin for "+roomId);
                }
                  
              }
            }
            if (matrixBanButton){
              matrixBanButton.onclick  = async function () {
                let allUsers = client.store.rooms[roomId].currentState.members;
                console.log("remove admin button for ",matrixUserList.selectedIndex, matrixUserList[matrixUserList.selectedIndex].value);
                let targetUserId = matrixUserList[matrixUserList.selectedIndex].value;
                console.log("target user",allUsers[targetUserId]);
                console.log("acting user",allUsers[matrixUser.userId]);

                const powerLevelEvent = client.store.rooms[roomId].currentState.getStateEvents('m.room.power_levels', '');
                try {
                  let changeResult = await client.setPowerLevel(roomId,targetUserId,0,powerLevelEvent);
                  notifier.success("successfully removed admin from "+targetUserId+" for "+roomId);
                  matrixAdminButton.style.visibility="visible";
                  matrixBanButton.style.visibility="hidden";
                } catch {
                  notifier.error("error attempting to remove admin from "+targetUserId+" for "+roomId);
                }
              }
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
    } else {
      console.log ("not creating room html",roomId,client);
    }

  }
}

export {
  register
}
