const { default: axios } = require("axios");
const hmacsha1 = require('hmacsha1');
const CryptoJS = require('crypto-js');

console.log("Registering Plug-in");
//const nostrtools = require ('nostr-tools');

async function register ({
  registerHook,
  registerSetting,
  settingsManager,
  storageManager,
  getRouter,
  peertubeHelpers,

}) {
  console.log("registered")
  registerSetting({
    name: 'matrix-home',
    label: 'Base Matrix Server',
    type: 'input',
    default: 'https://matrix.org',
    descriptionHTML: 'This is the matrix server rooms and users are created on',
    private: false
  })
  registerSetting({
    name: 'matrix-admin',
    label: 'Matrix account to administer the chat rooms',
    default: 'goku',
    type: 'input',
    descriptionHTML: 'account to create users and rooms and bestow admin powers',
    private: false
  })
  registerSetting({
    name: 'matrix-admin-token',
    label: 'Matrix token for admin account',
    type: 'input-password',
    descriptionHTML: 'access token for admin account, can be grabbed from element',
    private: true
  })
  registerSetting({
    name: 'matrix-user-auto',
    label: 'Automatically create local matrix accounts for peertube accounts',
    type: 'input-checkbox',
    descriptionHTML: 'This will enable user avatars and display names. Can use shared secret or open registration',
    deault:true,
    private: false
  })
  registerSetting({
    name: 'matrix-room-auto',
    label: 'Automatically create local matrix rooms for every channel',
    type: 'input-checkbox',
    descriptionHTML: 'This will create rooms on the home server for every channel. if disabled only channels with manually configured room addresses will have chat available',
    deault:true,
    private: false
  })

  registerSetting({
    name: 'matrix-shared-secret',
    label: 'Shared secret to allow account creation on matrix server',
    type: 'input-password',
    descriptionHTML: 'should be the same as the one configured in synapse/dendrite, if not present open registration will be attempted',
    private: true
  })

  registerSetting({
    name: 'matrix-prefix',
    label: 'used with shared Matrix servers to make unique room/user names',
    type: 'input',
    descriptionHTML: 'should be the same as the one configured in synapse/dendrite, if not present open registration will be attempted',
    private: true
  })
  registerSetting({
    name: 'matrix-always',
    label: 'Enable matrix chat for channels even when not actively livestreaming',
    type: 'input-checkbox',
    descriptionHTML: 'This will enable Matrix chat on every video at all times, not just on livestreams',
    deault:true,
    private: false
  })

  registerSetting({
    name: 'matrix-anon-allow',
    label: 'Allow unlogged in users to partake anonymously in chat',
    type: 'input-checkbox',
    descriptionHTML: 'This will enable system anon account in all channels. If channels have problems they can moderate the anon accunt',
    deault:true,
    private: false
  })

  registerSetting({
    name: 'matrix-anon',
    label: 'Matrix account for unlogged in users',
    default: 'anon',
    type: 'input',
    descriptionHTML: 'Matrix account to use for unlogged in users',
    private: false
  })
  registerSetting({
    name: 'matrix-anon-token',
    label: 'Matrix token for anon account',
    type: 'input-password',
    descriptionHTML: 'access token for unlogged in users to chat, can be grabbed from element',
    private: true
  })
  var base = await peertubeHelpers.config.getWebserverUrl();
  let adminToken = await settingsManager.getSetting("matrix-admin-token");
  let homeServer = await settingsManager.getSetting("matrix-home");
  let sharedSecret = await settingsManager.getSetting("matrix-shared-secret");
  let anonUser = await settingsManager.getSetting("matrix-anon");
  let anonToken = await settingsManager.getSetting("matrix-anon-token");
  let autoUser = await settingsManager.getSetting("matrix-user-auto");
  let autoRoom = await settingsManager.getSetting("matrix-room-auto");
  let enableAnon = await settingsManager.getSetting("matrix-anon-allow");
  let prefix = await settingsManager.getSetting("matrix-prefix");
  let parts = homeServer.split("/");
  console.log("parts:",parts);
  let matrixDomain = parts[2];
  if (anonUser && anonUser.indexOf(':')<1){
    anonUser=anonUser+":"+matrixDomain;
  }
  if (anonUser && anonUser.indexOf('@')!=0){
    anonUser='@'+ anonUser
  }
  let anonUserObject ={
    baseUrl: homeServer,
    accessToken: anonToken,
    userId: anonUser
  }
  let password="cryptodid";
  console.log ("███ matrix plugin settings",homeServer,prefix,anonUser, enableAnon);
  const router = getRouter();
  router.use('/getmatrixuser', async (req,res) => {
    console.log("███ getting matrix user",req.query,req.query.anon,enableAnon);
    if (req.query.anon && enableAnon){
      return res.status(200).send(anonUserObject);
    }
    if (req.query.anon){
      return res.status(400).send("anonymous access not enabled by sysop.");
    }
    let user = await peertubeHelpers.user.getAuthUser(res);
    //console.log("███ returned user",user);
    if (user && user.dataValues) {
      console.log("███ got authorized peertube user",user.dataValues.username);
      let userName = user.dataValues.username;
      let matrixUser;
      matrixUser = await storageManager.getData("mu-" + userName);
      console.log("███ returned saved matrix user",userName,matrixUser)
      if (matrixUser && (matrixUser.baseUrl == "https://undefined" || !matrixUser.userId)){
        matrixUser = undefined;
      }
      if (matrixUser){
        /*
        if (!matrixUser.password){
          matrixUser.password=password;
        }
        */
        console.log("███ saved matrix user",userName,matrixUser);
        /*
          if (await checkTokenValid(matrixUser)){
          console.log("███ checked user token passes",matrixUser);
          return res.status(200).send(matrixUser);
        } else {
          console.log("███ refreshing user",matrixUser);
          refreshUser = await refreshUserToken(matrixUser);
          if (refreshUser){
            matrixUser=refreshUser;
            console.log("███ refreshed matrix user",userName,matrixUser);
            if (checkTokenValid(matrixUser)){
              storageManager.storeData("mu-"+userName,matrixUser);
              return res.status(200).send(matrixUser);
            }
          } else {
            console.log("███ failed to refresh user",matrixUser);
          }
        }
        */
        return res.status(200).send(matrixUser);
      } else {
        console.log("███ checking to see if user exists",userName)
        let testUser= {};
        testUser.baseUrl = homeServer;
        testUser.userId = userName;
        testUser.password=password;
        matrixUser = await refreshUserToken(testUser);
        if (matrixUser){
          console.log("███ storing and returning matrix user",matrixUser);
          storageManager.storeData("mu-"+userName,matrixUser);
          return res.status(200).send(matrixUser);
        } else {
          console.log("███ unable to refresh token for",userName);
        }
      }
      if (autoUser){
        let newUser = await sharedCreateUser(userName);
        if (newUser){
          console.log("███ created new user with shared secret",userName,newUser);
          storageManager.storeData("mu-"+userName,newUser);
          return res.status(200).send(newUser);
        }
        newUser = await createUser(userName);
        if (newUser){
          console.log("███ created new user",userName,newUser);
          storageManager.storeData("mu-"+userName,newUser);
          return res.status(200).send(newUser);
        }       
      } else {
        console.log("no existing user account and new account creation disabled",userName);
        return;
      }
    }
    /*
    if (enableAnon){
      console.log("no authorized user, sending anon user");
      let anonUserObject ={
        baseUrl: homeServer,
        accessToken: anonToken,
        userId: anonUser,
      }
      let hack ={
        baseUrl: "https://matrix.peertube.support",
        accessToken: "syt_YW5vbg_nwFywLZphmgGoMdPHrJM_2MUpk2",
        userId: "@anon:matrix.peertube.support"
      }
      console.log("███ default matrix user",hack,anonUserObject)
      //return res.status(200).send(anonUserObject);
      
        console.log("███ returning anon user");
        return res.status(200).send(hack);
    }
    */
    console.log("███ account not found returning 404 error");
    return res.status(404).send();
  })
  router.use('/setmatrixuser', async (req,res) => {
    console.log("███ setting matrix user",req.body);
    let user = await peertubeHelpers.user.getAuthUser(res);
    //console.log("███ returned user",user);
    if (user && user.dataValues) {
      console.log("███ got authorized peertube user",user.dataValues.username);
      let userName = user.dataValues.username;
      let matrixUser=req.body;
      if (matrixUser){
        await storageManager.storeData("mu-" + userName,matrixUser);
        console.log("███ saved matrix user",userName,matrixUser)
        return res.status(200).send();
      }
    }
    console.log("███ account not found returning 404 error");
    return res.status(404).send("failed to set matrix user information");
  })
  router.use('/getchatroom', async (req, res) => {
    console.log("███ getting chatroom ███",req.query);
    if (!req.query.channel){
      return res.status(400).send();
    }
    //return res.status(200).send("!ULdntgxAgvbNuXZQGu:matrix.org");
    let user = await peertubeHelpers.user.getAuthUser(res);
    if (user){
      console.log("███ authorized user",user.dataValues.username);
    } else {
      console.log("failed to load authorized user",res)
    }
    let matrixUser = await storageManager.getData("mu-" + user.dataValues.username);
    let channel = req.query.channel;
    //hack for crossnetwork alpha testing
    if (channel=="live@jupiter.tube"){
      return res.status(200).send(`!gJYEKNllaubNlNkFIj:jupiterbroadcasting.com`);
    }
    let parts = channel.split('@');
    console.log("███ parts",parts);
    let customChat;
    if (parts.length > 1) {
      //let matrixUser = await storageManager.getData("mu-" + user.dataValues.username);
      let chatApi = "https://" + parts[1] + "/plugins/matrixchat/router/getchatroom?channel=" + parts[0];
      console.log("███remote chat room request",chatApi);
      try {
        customChat = await axios.get(chatApi);
      } catch {
        console.log("███hard error getting remote custom chat room for ", channel, "from", parts[1], chatApi);
      }
      if (customChat) {
        console.log("███ returning", customChat, "for", channel);
        //if (matrixUser){
        //  sendInvite(customChat.data,matrixUser.userId);
        //}
        return res.status(200).send(customChat.data);
      }
      console.log("███ failed to get remote room id");
      return res.status(400).send();
    }
    let chatRoom;
    if (channel) {
      try {
        chatRoom = await storageManager.getData("matrix" + "-" + channel)
      } catch (err) {
        console.log("███ error getting chatroom for ", channel);
      }
    }
    console.log("███ chat room for", channel, "is",chatRoom);
    if (chatRoom) {
      console.log("███ user",user);
      
      if (matrixUser){
        if (user.dataValues.role==0){
          let fixedChatRoom = encodeURIComponent(chatRoom);
          let setAdminApi = homeServer+"/_synapse/admin/v1/rooms/"+fixedChatRoom+"/make_room_admin"
          let adminBody = { "user_id": matrixUser.userId};
          let headers = {headers: {Authorization: 'Bearer ' + adminToken}}
          try {
            console.log("███ set admin",setAdminApi,matrixUser,adminBody,headers);
            let madeAdmin= await axios.post(setAdminApi,adminBody,headers)
            //console.log("███ made admin",madeAdmin);
          } catch (err){
            console.log("failed to make admin",err);
          }
        } else {
          console.log("███ user not admin",user);
        }
      }
      console.log("███ matrix user",matrixUser);
      /*
      if (matrixUser){
        sendInvite(chatRoom,matrixUser.userId);
        let userJson = {user_id: matrixUser.userId};
        console.log("███ user json",userJson,matrixUser);
        let userParts = matrixUser.userId.split(":");
        let roomServer = "https://"+userParts[1]
        let inviteApi=roomServer+`:8448/_matrix/client/r0/rooms/`+encodeURIComponent(chatRoom)+`/invite`
        let headers = {headers: {Authorization: 'Bearer ' + adminToken }};
        let result;
        try {
          result = await axios.post(inviteApi,userJson,headers);
          console.log("sent invite",result.statusText);
        } catch (err) {
          console.log("failed sending invite",inviteApi,userJson,headers,err);
        }
      } else {
        console.log("███ no matrix user found to invite");
      }
      */      
      return res.status(200).send(chatRoom);
    }
    if (channel && autoRoom){
      if (prefix){
        matrixChannel=prefix+"-"+channel
      } else {
        matrixChannel=channel;
      }
      let roomAlias = encodeURIComponent("#"+matrixChannel+":"+matrixDomain);
      let roomCheckApi = homeServer+'/_matrix/client/v3/directory/room/'+roomAlias;
      let roomCheckData;
      try {
        roomCheckData = await axios.get(roomCheckApi);
        if (roomCheckData){
          if (roomCheckData.data){
            console.log("███ room found for default room alias",roomCheckApi,roomCheckData);
            let configureResult = await storageManager.storeData("matrix" + "-" + channel, roomCheckData.data.room_id);
            //console.log("███ configured the new room",configureResult);
            return res.status(200).send(roomCheckData.data.room_id);
          }
        }
      } catch(err) {
        console.log("███ hard error trying to get room by alias",err,roomCheckApi);
      }
      console.log("███ no chat room found with default alias, creating new room")

      let createRoomApi = homeServer+":8448/_matrix/client/r0/createRoom?access_token="+adminToken;
      let roomData = {};
      roomData.room_alias_name = matrixChannel;
      roomData.visibility = "public";
      roomData.preset= "public_chat";

      let roomConfigureApi,roomConfigureData;
      try {
        creationResult = await axios.post(createRoomApi, roomData );
        console.log("███created room",channel,creationResult.data);

        let fixedRoomName = encodeURIComponent(creationResult.data.room_id);
        roomConfigureApi = homeServer+"/_matrix/client/r0/rooms/"+fixedRoomName+"/state/m.room.guest_access"
        roomConfigureData = {"guest_access": "can_join"};
        let headers = {
          headers: {
            Authorization: 'Bearer ' + adminToken
          }
        }
        console.log("███ attempting to set guest access",roomConfigureApi,roomConfigureData,headers);
        await axios.put(roomConfigureApi,roomConfigureData,headers);
        let configureResult = await storageManager.storeData("matrix" + "-" + channel, creationResult.data.room_id);
        //console.log("███ configured the new room",configureResult);
        return res.status(200).send(creationResult.data.room_id);
      } catch (err) {
        console.log("███ unable to create chatroom for █",channel,"█",createRoomApi,"█",roomData,"█",roomConfigureApi,"█",roomConfigureData,"█","█",err);
      }
      try {
        creationResult = await axios.post(createRoomApi, roomData );
        console.log("created room",channel,creationResult.data);
        await storageManager.storeData("matrix" + "-" + channel, creationResult.data.room_id);
        return res.status(200).send(creationResult.data.room_id);
      } catch (err) {
        console.log("███ unable to create chatroom for █",channel,"█",createRoomApi,"█",roomData,"█",err);
      }
      //return res.status(400).send();
      //return basic devops room
      return res.status(200).send("!ULdntgxAgvbNuXZQGu:matrix.org");
    }
  })
  router.use('/setchatroom', async (req, res) => {
    console.log("███setting chatroom", req.query);
    let user = await peertubeHelpers.user.getAuthUser(res);
    if (!user){
      console.log("no authorized user",req.query)
        return res.status(400).send();
    }
    console.log("███ user attempting to set room id ", user.dataValues.username);
    console.log(user.dataValues.adminFlags);
    let channel = req.query.channel;
    let chatroom = req.query.chatroom;
    if (chatroom.substring(0,1) == "#"){
      let roomAlias = encodeURIComponent(chatroom);
      let roomCheckApi = homeServer+'/_matrix/client/v3/directory/room/'+roomAlias;
      let roomCheckData;
      try {
        roomCheckData = await axios.get(roomCheckApi);
        if (roomCheckData){
          if (roomCheckData.data){
            console.log("███ room found for default room alias",roomCheckApi,roomCheckData.data);
            let configureResult = await storageManager.storeData("matrix" + "-" + channel, roomCheckData.data.room_id);
            //console.log("███ configured the new room",configureResult);
            return res.status(200).send(roomCheckData.data.room_id);
          }
        }
      } catch(err) {
        console.log("███ hard error trying to get room by alias",err.code,roomCheckApi);
       // return res.status(400).send("error setting chatroom");
      }
    }
    if (channel && chatroom) {
      try {
        await storageManager.storeData("matrix" + "-" + channel, chatroom);
        return res.status(200).send(chatroom);
      } catch (err) {
        console.log("███ error getting chatroom", channel,chatroom,err);
      }
    }
    return res.status(400).send("error setting chatroom");
  })
  router.use('/sendinvite', async (req, res) => {
    console.log("███ Sending an invite", req.query);
    let channel = req.query.room;
    let target = req.query.user;
    let instance = req.query.instance;
    if (!channel || !target){
      console.log("███ malformed invite request",req.query);
       return res.status(400).send();
    }
    let redirectResult;
    if (instance){
      let redirectInviteApi = "https://"+instance+"/plugins/matrixchat/router/sendinvite?room="+channel+"&user="+target;
      try {
        redirectResult = await axios.post(redirectInviteApi);
        console.log("sent invite",redirectResult);
        return res.status(200).send(redirectResult.data);
      } catch (err) {
        console.log("failed sending invite",redirectInviteApi,err);
      }
    }
    let inviteServer = homeServer;
    let userJson = {user_id: target};
    let inviteApi=inviteServer+`:8448/_matrix/client/r0/rooms/`+encodeURIComponent(channel)+`/invite`
    let headers = {headers: {Authorization: 'Bearer ' + adminToken }};
    let result;
    try {
      result = await axios.post(inviteApi,userJson,headers);
      console.log("sent invite",result);
      return res.status(200).send(result.data);
    } catch (err) {
      console.log("failed sending invite",inviteApi,err);
    }
    return res.status(400).send();
  })
  async function checkTokenValid(user){
    let turnServer =  homeServer+'/_matrix/client/r0/voip/turnServer';
    let headers = {headers: {Authorization: 'Bearer ' + user.accessToken }};
    try {
      results = await axios.get(turnServer,headers);
      return true;
    } catch (err) {
      console.log("███ errored getting turnserver, need to regenerate access token",user,err);
      return false;
    }
  }
  async function refreshUserToken(user){
    let manualLogin = {};
    manualLogin.type="m.login.password";
    manualLogin.identifier = {"type": "m.id.user", "user": user.userId};
    manualLogin.password = user.password;
    let loginApi = homeServer+":8448/_matrix/client/r0/login"
    console.log("███ refresh token data",loginApi,manualLogin);
    let results,matrixUser
    try {
      results = await axios.post(loginApi,manualLogin);
      console.log("███ results",results);
    } catch (err) {
      console.log("███ error attempting password logon",manualLogin);
      if (err && err.results){
        console.log("err results data",err.results.data);
      } else {
        console.log("err results",err);
      }
    }
    if (results && results.data){
      console.log ("███ results data",results.data);
      matrixUser= {};
      if (results.data.home_server){
        matrixUser.baseUrl = "https://"+results.data.home_server;
      } else {
        matrixUser.baseUrl = homeServer;
      }
      matrixUser.userId = results.data.user_id;
      matrixUser.accessToken = results.data.access_token;
      matrixUser.password = results.data.password;
      console.log("███ refreshed matrix user ",matrixUser);
      return matrixUser;
    }
    console.log("failed to get refresh logon",user,matrixUser);
    return undefined;
  }
  async function getGuestUser(){
    let guestRegistrationApi = homeServer+"/_matrix/client/r0/register?kind=guest";
    let guestUser;
    try {
      guestUser = await axios.post(guestRegistrationApi, {});
      console.log("███ guest registration",guestUser.data);
      matrixUser= {};
      matrixUser.baseUrl = homeServer;
      matrixUser.userId = guestUser.data.user_id;
      matrixUser.accessToken = guestUser.data.access_token;
      console.log("███ guest matrix user ",matrixUser);
      return matrixUser;
    } catch (err) {
      console.log("███ failed getting guest account",guestUser,err);
    }
    return;
  }
  async function createUser(user){
    
      let newUser = {"username":user, "password":password, "auth": {"type":"m.login.dummy"}};
      let newUserApi= homeServer+":8448/_matrix/client/r0/register";
      console.log("███ attempting to create matrix user without secret",newUser,newUserApi);
      try {
        let matrixUserData = await axios.post(newUserApi,newUser);
        matrixUser= {};
        matrixUser.baseUrl = homeServer;
        matrixUser.userId = matrixUserData.data.user_id;
        matrixUser.accessToken = matrixUserData.data.access_token;
        matrixUser.password = password;
        console.log("███ new matrix user without secret ",matrixUser);
        storageManager.storeData("mu-"+user,matrixUser);
        return matrixUser;
      } catch(err) {
        console.log("███ failed registering new account without secret for",user,newUser,err);
      }

  }
  async function sharedCreateUser(user){
    console.log("███ creating user, user info",user);
    let nonce;
    let nonceRequest=homeServer+"/_synapse/admin/v1/register"
    try {
      let nonceResult = await axios.get(nonceRequest);
      if (nonceResult && nonceResult.data){
        console.log("███ nonce:",nonceResult.data);
        nonce = nonceResult.data.nonce;
      }
    } catch(err) {
      console.log("███ error attempting to get nonce",nonceRequest,err);
      return;
    }
    if (nonce){
      let newUser={};
      newUser.nonce=nonce;
      newUser.username=user;
      newUser.password=password;
      newUser.admin = false;
      let macText=nonce+'\0'+user+'\0'+password+'\0'+"notadmin";
      let macEncodedString = Buffer.from(macText, 'utf-8').toString();
      let mac = hmacsha1(sharedSecret, macEncodedString);
      let mac3 = hmacsha1(sharedSecret,macText);
      console.log("███ MAC::",mac,macText,mac3,macEncodedString);
      let mac2  = CryptoJS.HmacSHA1(macEncodedString, sharedSecret);
      
      let mac4 = CryptoJS.HmacSHA1(macText, sharedSecret);
      console.log("███ MAC2::",mac2+"",macText,mac4+'',macEncodedString);
      newUser.mac=mac4+"";
      try {
        let createResult = await axios.post(nonceRequest,newUser);
        if (createResult && createResult.data){
          console.log("███ created user:",createResult.data);
          let matrixUser= {};
          matrixUser.baseUrl = "https://"+createResult.data.home_server;
          matrixUser.userId = createResult.data.user_id;
          matrixUser.accessToken = createResult.data.access_token;
          matrixUser.password = password;
          console.log("███ new matrix user ",matrixUser);
          storageManager.storeData("mu-"+user,matrixUser);
          return matrixUser;
        }
      } catch(err) {
        console.log("███ error attempting to get nonce",nonceRequest,err);
        return;
      }
    } else {
      console.log("███ nonce is undefined",nonceRequest);
      return;
    }
  }
  async function sendInvite(channel,target){
    let userJson = {user_id: target};
    //let roomParts = channel.split(":");
    //let roomServer = "https://"+roomParts[1]
    let inviteApi=homeServer+`:8448/_matrix/client/r0/rooms/`+encodeURIComponent(channel)+`/invite`
    let headers = {headers: {Authorization: 'Bearer ' + adminToken }};
    let result;
    try {
      result = await axios.post(inviteApi,userJson,headers);
      console.log("sent invite",result);
      return res.status(200).send(result.data);
    } catch (err) {
      console.log("failed sending invite",inviteApi,err);
    }
  }
}
async function unregister () {
  return
}

module.exports = {
  register,
  unregister
}
