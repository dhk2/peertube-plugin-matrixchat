const { default: axios } = require("axios");

console.log("Registering Plung-in");
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
    type: 'input',
    descriptionHTML: 'access token for admin account, can be grabbed from element',
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
  var base = await peertubeHelpers.config.getWebserverUrl();
  let adminToken = await settingsManager.getSetting("matrix-admin-token");
  let homeServer = await settingsManager.getSetting("matrix-home");

const router = getRouter();
router.use('/getmatrixuser', async (req,res) => {
  console.log("███ getting matrix user",req.query);
  let user = await peertubeHelpers.user.getAuthUser(res);
  //console.log("███ returned user",user);
  if (user) {
    let userName = user.dataValues.username;
    let matrixUser;
    matrixUser = await storageManager.getData("mu-" + userName);
    console.log("███ returned saved matrix user",userName,matrixUser)
    if (matrixUser){
      console.log("███ saved matrix user",userName,matrixUser);
      let turnServer =  homeServer+'/_matrix/client/r0/voip/turnServer';
      let results;
      let headers = {
        headers: {
          Authorization: 'Bearer ' + matrixUser.accessToken
        }
      }
      try {
        results = await axios.get(turnServer,headers);
      } catch (err) {
        console.log("███ errored getting turnserver, Trying to regenerate access token",err)
        results="crap";
      }
      console.log("███ turnsever check",turnServer,results);
      if (results === "crap"){
        let manualLogin = `{
          "type": "m.login.password",
          "identifier": {
            "type": "m.id.user",
            "user": "`+matrixUser.userId+`"
          },
          "password": "cryptodid",
          "session": "54321"
        }`
        let loginApi = homeServer+":8448/_matrix/client/r0/login"
        try {
          results = await axios.post(loginApi,manualLogin);
        } catch (err) {
          console.log("error attempting password logon",manualLogin,err);
        }
        if (results && results.data){
          console.log ("███ results data",results.data);
          matrixUser= {};
          matrixUser.baseUrl = homeServer;
          matrixUser.userId = results.data.user_id;
          matrixUser.accessToken = results.data.access_token;
          console.log("███ new matrix user ",matrixUser);
          storageManager.storeData("mu-"+userName,matrixUser);
          return res.status(200).send(matrixUser);
        }
      }
      return res.status(200).send(matrixUser);
    }
    let newUser = {"username":userName, "password":"cryptodid", "auth": {"type":"m.login.dummy"}};
    let newUserApi= homeServer+":8448/_matrix/client/r0/register";
    console.log("███ attempting to create matrix user",newUser,newUserApi);
    try {
      let matrixUserData = await axios.post(newUserApi,newUser);
      matrixUser= {};
      matrixUser.baseUrl = homeServer;
      matrixUser.userId = matrixUserData.data.user_id;
      matrixUser.accessToken = matrixUserData.data.access_token;
      console.log("███ new matrix user ",matrixUser);
      storageManager.storeData("mu-"+userName,matrixUser);
      return res.status(200).send(matrixUser);
    } catch(err) {
      console.log("███ failed registering new account for",userName,newUser,err);
    }
  }
  /* getting issues with guest account no working with sdk client client.on

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
     return res.status(200).send(matrixUser);
  } catch (err) {
    console.log("███ failed getting guest account",guestUser,err);
  }
  */
  let hack ={
    baseUrl: "https://invidious.peertube.biz",
    accessToken: "8rqR9Kdo5f_c_uFMk-NqyyJoJ4h_OP0ifvuRu25T_po",
    userId: "@anon:invidious.peertube.biz"
  }
  console.log("███ default matrix user",hack)
  return res.status(200).send(hack);
})
/*
router.use('/getusertoken', async (req,res) => {
  //console.log("███ auth user", await peertubeHelpers.user.getAuthUser());
  console.log("███ getting matrix user token ███");
  let hack ={"token" : "lVZqe6L9S5UVowl5kn8t-AknuUjaXEyJg0H8HI3Kh3Q"};
  return res.status(200).send(hack);
})
*/
router.use('/getchatroom', async (req, res) => {
  console.log("███ getting chatroom ███");
  //return res.status(200).send("!ULdntgxAgvbNuXZQGu:matrix.org");
  let channel = req.query.channel;
  let parts = channel.split('@');

  let customChat;
  if (parts.length > 1) {
    let chatApi = "https://" + parts[1] + "/plugins/lightning/router/getchatroom?channel=" + parts[0];
    try {
      customChat = await axios.get(chatApi);
    } catch {
      console.log("hard error getting custom chat room for ", channel, "from", parts[1], chatApi);
    }
    if (customChat) {
      console.log("returning", customChat.toString(), "for", channel);
      return res.status(200).send(customChat.data);
    }
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
    return res.status(200).send(chatRoom);
  }
  if (channel){
    let createRoomApi = homeServer+":8448/_matrix/client/r0/createRoom?access_token="+adminToken;
    let roomData = {};
    roomData.room_alias_name = "p2ptube-"+channel
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
    return res.status(200).send("!ULdntgxAgvbNuXZQGu:matrix.org");
  }
})
router.use('/setchatroom', async (req, res) => {
  console.log("███setting chatroom", req.query);
  let channel = req.query.channel;
  let chatroom = req.query.chatroom;
  let parts = channel.split('@');
  if (parts.length > 1) {
    console.log("███ unable to configure chatroom for remote channel",channel);
    return res.status(503).send();
  }
  if (channel) {
    try {
      await storageManager.storeData("matrix" + "-" + channel, chatroom);
      return res.status(200).send(chatroom);
    } catch (err) {
      console.log("███ error getting chatroom", channel,chatroom);
    }
  }
  return res.status(400).send();
})
}

async function unregister () {
  return
}

module.exports = {
  register,
  unregister
}
