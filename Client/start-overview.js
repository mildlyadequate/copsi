// Electron
const electron = require('electron');
const shortid = require('shortid');
const moment = require('moment');
const {ipcRenderer,shell,Menu,dialog} = electron;
const initialWindowHeight = 630;

// Custom Modules
const msgModule = require('./shared-objects/message-object.js');  
const Message = msgModule.Message;
const chnModule = require('./shared-objects/channel-object.js');  
const Channel = chnModule.Message;
const utils = require('./shared-objects/utils.js');  

// Server Display Elemente
const divServerUserList = document.getElementById('divServerUserList');
const navServerChannelList = document.getElementById('sm-channel-list');
const ulServerListLeft = document.getElementById('serverListeLinks');

// Content
const divDatePin = document.getElementById('sm-content-datepin');
const divchannelTitle = document.getElementById('sm-channel-title');
const divContentChat = document.getElementById('sm-content-chat');
const divContentFiles = document.getElementById('sm-content-files');
const divMessageContainer = document.getElementById('divMessageContainer');
const fileContainer = document.getElementById('fileContainer');

// Button
const btnFileUpload = document.getElementById('sm-file-upload');

// Textfeld
const txaMessage = document.getElementById('txaMessage');

// Variablen
let selectedServerObject;
let selectedServerId = '';
let selectedChannelId = '';
let selectedChannelType;
let serverDataObject;

// Me
let userMe;
let roleMe;

// IPC 

// Window resize
ipcRenderer.on('window:resize',function(e,height){
  // Trial error value of 186 depends on navbar, infobar and taskbar
  resizeContainers(height);
});

// Wenn verbindung zu server hergestellt wurde
ipcRenderer.on('server:connected',function(e){

  console.log('connected');

});

// bei login gesendet von server, enthält alle nötigen serverdaten
ipcRenderer.on('user:personal-user-info',function(e,initObject){

  resizeContainers(initialWindowHeight);

  // Server Objekt und eigenes User Objekt
  var serverData = initObject[0];
  userMe = initObject[1];

  // Variablen um aktuell selektierten Server/Channel zu merken
  selectedServerId = serverData[0].id;

  // Auf globale Variable setzen
  serverDataObject = serverData;

  // Serverliste erstellen und server selektieren
  setServerList(serverData);
  serverChanged(selectedServerId);

  // Aktuellen Channel wechseln TODO: dynamisch den ersten channel erkennen
  selectFirstChannel(serverDataObject[0]);

  // Markiere selektierten Channel
  var newSelected = document.getElementById('srvObj_'+selectedServerId);
  newSelected.classList.add('sm-activated');
});

// Wenn eine Nachricht empfangen wurde
ipcRenderer.on('server:message',function(e,msg){



  // Check ob Nachricht auf aktuellem Server
  if(msg.serverId == selectedServerId){

    // Check ob Nachricht anonym
    if(msg.type == msgModule.type.anon){
      divMessageContainer.appendChild(getAnonMessageElement(msg));
    }else{
      divMessageContainer.appendChild(getMessageElement(msg));
    }
  }

  // Runter Scrollen
  divContentChat.scrollTop = divContentChat.scrollHeight;
});

// Empfange alte Nachrichten nachdem der Channel geändert wurde
ipcRenderer.on('channel:receive:old-messages',function(e,channeldata){

  var messages = channeldata.messages;

  //TODO Check ob immernoch der gleiche channel ausgewählt ist

  //TODO nur die letzten 50 Nachrichten laden (am besten schon im server)
  divMessageContainer.innerHTML = '';

  // Wenn keine Nachrichten vorhanden sind, zeige Bild + Nachricht
  // TODO verschwindet nicht wenn eine Nachricht geschickt wird
  if(channeldata.messages.length==0){
    showEmptyChannelIcon();
  }else{

    // Wenn Nachrichten vorhanden sind, füge sie dem div hinzu
    if(channeldata.type == chnModule.type.anonchat){
      for(var i=0;i<messages.length;i++){
        console.log(messages[i].senderId);
        divMessageContainer.appendChild(getAnonMessageElement(messages[i]));
      }
    }else{
      for(var i=0;i<messages.length;i++){
        divMessageContainer.appendChild(getMessageElement(messages[i]));
      }
    }
  }

  // Runter Scrollen
  divContentChat.scrollTop = divContentChat.scrollHeight;
});

// Empfange alte Nachrichten nachdem der Channel geändert wurde
ipcRenderer.on('channel:files:set:metadata',function(e,package){
  //TODO Check ob immernoch der gleiche channel ausgewählt ist

  for(var i=0;i<package.metadata.length;i++){

    fileContainer.appendChild(getFileElement(package.metadata[i]));

  }
});

// Empfange metadaten zur zuletzt hochgeladenen Datei
ipcRenderer.on('channel:files:get:uploaded',function(e,package){
  //TODO Check ob immernoch der gleiche channel ausgewählt ist

  fileContainer.appendChild(getFileElement(package));

});

/*
//////////////////////////// Interface Creation Functions ////////////////////////////////////////
*/

// Dynamische container leeren
function clearServerInterface(){

  // Channels
  navServerChannelList.innerHTML = '';

  // User
  divServerUserList.innerHTML = '';

  // Messages
  divMessageContainer.innerHTML = '';
}

// Wird angezeigt wenn keine Nachrichten in einem Channel existieren
function showEmptyChannelIcon(){
  var tmp = document.createElement('div');
  tmp.classList.add('level-item');
  tmp.classList.add('has-text-centered');
   
  var icon = document.createElement('i');
  icon.classList.add('fas');
  icon.classList.add('fa-frown');

  var separator = document.createElement('br');

  var inner = document.createElement('p');
  inner.innerText = "Noch keine Nachrichten vorhanden!";
  tmp.appendChild(inner);
  inner.appendChild(separator);
  inner.appendChild(icon);

  divMessageContainer.appendChild(tmp);
}

// Serverliste ganz links anzeigen
function setServerList(serverData){

  for(var i=0;i<serverData.length;i++){

    // Link Element A
    var aServerShort = document.createElement('a');
    aServerShort.classList.add('sm-server-shortname');
    aServerShort.innerText = serverData[i].shortName;
    // Onclick in for Schleife muss so aussehen weil: https://stackoverflow.com/questions/6048561/setting-onclick-to-use-current-value-of-variable-in-loop
    var srvId = serverData[i].id;
    aServerShort.id = 'srvObj_'+srvId;
    aServerShort.onclick = function(arg) {
      return function() {
        // Check ob der Server schon angewählt ist
        if(arg!=selectedServerId){
          serverChanged(arg);
        }
      }
    }(srvId);

    // A Container Div
    var div = document.createElement('div');
    // Container Klasse braucht man nicht
    // div.classList.add('sm-server-shortname-container');
    div.appendChild(aServerShort);

    // Span - Span in der Serverliste ist überflüssig und zerschießt die Struktur
    // var spanServerShort = document.createElement('span');
    // spanServerShort.classList.add('icon');
    // spanServerShort.classList.add('is-medium');
    // spanServerShort.appendChild(div);

    // li
    var liServerShort = document.createElement('li');
    liServerShort.appendChild(div);

    // Äußerer Container
    var divServerShort = document.createElement('div');
    divServerShort.classList.add('sm-team-icons');
    // Wenn Server der aktuell selektierte ist 
    // sm-activated wird a hinzugefügt, nicht div
    if(serverData[i].id == selectedServerId){
      aServerShort.classList.add('sm-activated');
    }
    divServerShort.appendChild(liServerShort);

    // Zu ul hinzufügen
    ulServerListLeft.appendChild(divServerShort);
  }
}

// Ändere den Server Titel oben links über der Channelübersicht
function setServerTitle(title){
  document.getElementById('hServerTitle').innerText = title;
}

// Channel des Servers darstellen
function setChannels(channels){

  // Für jeden Channel
  for(var i=0;i<channels.length;i++){
    
    // Wenn der Channel eine Kategorie ist
    if(channels[i].isCategory){

      // Kategorie als P Element erstellen
      var pCategoryName = document.createElement('p');
      pCategoryName.classList.add('menu-label');
      pCategoryName.innerText = channels[i].name;
      navServerChannelList.appendChild(pCategoryName);

      // Wenn die Kategorie unter Channel hat
      if(channels[i].childChannels != null && channels[i].childChannels.length != 0){

        // Unter Channel für Kategorie
        var tmpChildChannels = channels[i].childChannels;
        var ulChildChannels = document.createElement('ul');
        ulChildChannels.classList.add('menu-list');
        for(var j=0;j<tmpChildChannels.length;j++){

          // Icon
          var iChildChannelIcon = document.createElement('i');
          iChildChannelIcon.classList.add('fas');
          // Icon Code vom Channel Objekt
          iChildChannelIcon.classList.add(tmpChildChannels[j].picture);

          // Span
          var spanChildChannel = document.createElement('span');
          spanChildChannel.classList.add('is-small');
          spanChildChannel.classList.add('icon');
          spanChildChannel.appendChild(iChildChannelIcon);

          // Tmp Div Container
          var tmpDiv = document.createElement('div');
          tmpDiv.appendChild(spanChildChannel);

          // Link
          var aChildChannelLink = document.createElement('a');
          aChildChannelLink.id = 'chnObj_'+tmpChildChannels[j].id;
          aChildChannelLink.href = '#';
          aChildChannelLink.innerHTML = tmpDiv.innerHTML + ' ' + tmpChildChannels[j].name;
          aChildChannelLink.onclick = function(arg) {
            return function() {
              // TODO Channel ändern und alte nachrichten laden
              channelChanged(arg);
            }
          }(tmpChildChannels[j]);

          // List Element
          var liChildChannel = document.createElement('li');
          liChildChannel.appendChild(aChildChannelLink);

          // An Liste anhängen
          ulChildChannels.appendChild(liChildChannel);
        }
      

      // An Kategorie anhängen
      navServerChannelList.appendChild(ulChildChannels);
    }

      // Wenn der Channel ein einfacher Channel ist
    }else{

      // TODO kp vielleicht kommt hier was hin. channel außerhalb einer kategorie

    }

  }

}

// Nutzer des servers darstellen
function setServerUserList(currentServerData){

  // Für Jede Rolle ein Abteil
  for(var i=0;i<currentServerData.roles.length;i++){

    // P Element mit Rollen Name
    var txtRoleLabel = document.createElement('p');
    // Set ID
    txtRoleLabel.classList.add('menu-label');
    txtRoleLabel.innerText = currentServerData.roles[i].name;
    txtRoleLabel.id = 'ServerRoleListP_'+currentServerData.roles[i].id;
    divServerUserList.appendChild(txtRoleLabel);

    // Liste der User mit der aktuellen Rolle
    var ulUsersOfRole = document.createElement('ul');
    ulUsersOfRole.classList.add('menu-list');
    ulUsersOfRole.id = 'ServerRoleListUl_'+currentServerData.roles[i].id;

    divServerUserList.appendChild(ulUsersOfRole);
  }

   // Für jeden User
   for(var j=0;j<currentServerData.users.length;j++){

    // Icon
    var iUserIcon = document.createElement('i');
    iUserIcon.classList.add('fas');
    iUserIcon.classList.add('fa-fish');

    // Icon Container
    var spanUserLabelIcon = document.createElement('span');
    spanUserLabelIcon.classList.add('icon');
    spanUserLabelIcon.classList.add('is-small');
    spanUserLabelIcon.appendChild(iUserIcon);
    
    // tmp div um inner Html zu bekommen
    var tmpDivIcon = document.createElement('div');
    tmpDivIcon.appendChild(spanUserLabelIcon);

    // Text und Link
    var aUserLink = document.createElement('a');
    // TODO Verlinkung lol
    aUserLink.href = '/bulma-admin-dashboard-template/forms.html';
    aUserLink.innerHTML = tmpDivIcon.innerHTML+' '+currentServerData.users[j].nickname;
    //aUserLink.innerText = currentServerData.users[j].nickname;
    //aUserLink.appendChild(spanUserLabelIcon);

    // Listen Element
    var liUser = document.createElement('li');
    liUser.appendChild(aUserLink);
    document.getElementById('ServerRoleListUl_'+currentServerData.users[j].role).appendChild(liUser);
  }
}

// Erzeugt eine Nachricht im Html
function getMessageElement(msg){

  // ARTICLE DIV 1
  // Image
  var image = document.createElement('img');
  image.src= 'assets/img/placeholder/prof.png';

  // Figure
  var figure = document.createElement('figure');
  figure.classList.add('image');
  figure.classList.add('is-64x64');
  figure.appendChild(image);

  // Image Div
  var divImage = document.createElement('div');
  divImage.classList.add('media-left');
  divImage.appendChild(figure);

  // ARTICLE DIV 2
  // User Name mit ID aus Server Objekt laden
  var uName = 'name';
  var uRoleId;
  for(var i=0;i<selectedServerObject.users.length;i++){
    if(selectedServerObject.users[i].id==msg.senderId){
      uName = selectedServerObject.users[i].nickname;
      uRoleId = selectedServerObject.users[i].role;
    }
  }
  // Rollen Name mit ID aus Server Objekt laden
  var uRole = 'role';
  for(var i=0;i<selectedServerObject.roles.length;i++){
    if(selectedServerObject.roles[i].id==uRoleId){
      uRole = selectedServerObject.roles[i].name;
    }
  }
  // P Content Element
  var pContent = document.createElement('p');
  pContent.innerHTML = '<strong>'+uName+'</Strong> <small>'+uRole+'</small> <small>'+moment(msg.timestamp).format("DD.MM.YYYY, HH:mm")+'</small> <br>'+msg.content;

  // Content Inner Div
  var divInnerContent = document.createElement('div');
  divInnerContent.classList.add('content');
  divInnerContent.appendChild(pContent);

  // Content Div
  var divContent = document.createElement('div');
  divContent.classList.add('media-content');
  divContent.appendChild(divInnerContent);

  // ARTICLE
  var article = document.createElement('article');
  article.classList.add('media');
  article.appendChild(divImage);
  article.appendChild(divContent);

  // Äußerer Container
  var divBox = document.createElement('div');
  divBox.classList.add('box');
  divBox.appendChild(article);

  return divBox;
}

// Erzeugt eine Nachricht im Html
function getAnonMessageElement(msg){

  // P Content Element
  var pContent = document.createElement('p');
  //TODO Name generieren und in strong einfügen
  pContent.innerHTML = '<strong>'+''+'</Strong><small>'+moment(msg.timestamp).format("DD.MM.YYYY, HH:mm")+'</small> <br>'+msg.content;

  // Content Inner Div
  var divInnerContent = document.createElement('div');
  divInnerContent.classList.add('content');
  divInnerContent.appendChild(pContent);

  // Content Div
  var divContent = document.createElement('div');
  divContent.classList.add('media-content');
  divContent.appendChild(divInnerContent);

  // ARTICLE
  var article = document.createElement('article');
  article.classList.add('media');
  article.appendChild(divContent);

  // Äußerer Container
  var divBox = document.createElement('div');
  divBox.classList.add('box');

  var colour = hexToRgb(msg.senderId);

  divBox.style.backgroundColor = "rgba("+colour.r+","+colour.g+","+colour.b+",0.3)";
  divBox.appendChild(article);

  return divBox;
}


// Erstellt ein File ELement in html
function getFileElement(fileMetainfo){
  var fileIcon = document.createElement('i');
  fileIcon.classList.add('fas');
  fileIcon.classList.add('fa-file-pdf');

  var thFileIcon = document.createElement('th');
  thFileIcon.appendChild(fileIcon);

  var tdName = document.createElement('td');
  tdName.innerText = fileMetainfo.metadata.filename;

  var tdSize = document.createElement('td');
  tdSize.innerText = utils.formatBytes(fileMetainfo.length,2);

  var tdTimestamp = document.createElement('td');
  var dateTime = moment(fileMetainfo.uploadDate);
  tdTimestamp.innerText = dateTime.format("DD.MM.YYYY HH:mm");

  var downloadIcon = document.createElement('i');
  downloadIcon.classList.add('fas');
  downloadIcon.classList.add('fa-download');

  var link = document.createElement('a');
  link.onclick = function(arg) {
    return function() {
      ipcRenderer.send('channel:file:download',{filename: arg, serverId: selectedServerId});
    };
  }(fileMetainfo.filename);
  link.appendChild(downloadIcon);

  var thDownloadIcon = document.createElement('th');
  thDownloadIcon.appendChild(link);

  var trContainer = document.createElement('tr');
  trContainer.appendChild(thFileIcon);
  trContainer.appendChild(tdName);
  trContainer.appendChild(tdSize);
  trContainer.appendChild(tdTimestamp);
  trContainer.appendChild(thDownloadIcon);

  return trContainer;
}

/*
//////////////////////////// User Interaction Functions ////////////////////////////////////////
*/

// Aufgerufen jedesmal wenn sich die Größe des Fensters ändert, einmal beim Start 
function resizeContainers(height){
  divContentChat.style.height = (height - 410)+'px';
  navServerChannelList.style.height = (height - 140)+'px';
//  divContentFiles.style.height = (height - 140)+'px';
}

// Aufgerufen durch Button oben links
function openFrontpage(){
  console.log("Öffne frontpage");
}

// Lade die aktuelle Rolle des eingeloggten Users
function getMyCurrentRole(){

  // Finde selektierten Server
  for(var j=0;j<serverDataObject.length;j++){
    if(serverDataObject[j].id==selectedServerId){
      
      // Finde eingeloggten User
      for(var i=0;i<serverDataObject[j].users.length;i++){
        if(serverDataObject[j].users[i].id==userMe.id){

          // Setze Variable
          roleMe = serverDataObject[j].users[i].role;

        }
      }
    }
  }
}

// Aufgerufen beim Start und wenn der Channel gewechselt wird
function channelChanged(arg){

  // Setze Channel Namen
  divchannelTitle.innerText = arg.name;

  // Leere Container
  divMessageContainer.innerHTML = '';
  fileContainer.innerHTML = "";

  // Selektierten Channel ändern
  var oldSelected = document.getElementById('chnObj_'+selectedChannelId);
  if(oldSelected != null){
    oldSelected.classList.remove('sm-activated');
  }
  var newSelected = document.getElementById('chnObj_'+arg.id);
  if(newSelected != null){
    newSelected.classList.add('sm-activated');
  }

  // Setze selektierte channel variable
  selectedChannelId = arg.id;
  // Channel Type
  selectedChannelType = arg.type;

  // Channel Typ CHAT
  if(arg.type==chnModule.type.chat){

    // Elemente einblenden
    divContentChat.classList.remove('hide');
    txaMessage.classList.remove('hide');
    // Elemente ausblenden
    divContentFiles.classList.add('hide');
    btnFileUpload.classList.add('hide');
    divDatePin.classList.add('hide');

    // Platzhalter im Textfeld ändern
    txaMessage.placeholder = 'Nachricht an @'+arg.name;

    // Event senden um alte Nachrichten zu laden
    ipcRenderer.send('channel:get:old-messages',{serverId: selectedServerId, channelId: selectedChannelId});

  // Channel Typ FILES
  }else if(arg.type==chnModule.type.files){

      // Elemente einblenden
      divContentFiles.classList.remove('hide');
      // Elemente ausblenden
      txaMessage.classList.add('hide');
      divContentChat.classList.add('hide');
      divDatePin.classList.add('hide');

      // Check welche Rechte dieser User hat
      if(arg.roleAbility.fileupload.includes(roleMe)){
        //TODO upload button einfügen
        btnFileUpload.classList.remove('hide');
      }else{
        btnFileUpload.classList.add('hide');
      }

      ipcRenderer.send('channel:files:get:metadata',{serverId: selectedServerId, channelId: selectedChannelId});

  // Channel Typ NEWS
  }else if(arg.type==chnModule.type.news){

    //TODO wenn aktueller user schreibrechte hat dann zeige chatbox
    // Elemente einblenden
    divContentChat.classList.remove('hide');
    divDatePin.classList.remove('hide');

    // Elemente ausblenden
    divContentFiles.classList.add('hide');
    btnFileUpload.classList.add('hide');

    if(arg.roleAbility.write.includes(roleMe)){
      txaMessage.classList.remove('hide');
    }

    // Platzhalter im Textfeld ändern
    txaMessage.placeholder = 'Nachricht an @'+arg.name;

    if(arg.roleAbility.read.includes(roleMe)){
      // Event senden um alte Nachrichten zu laden
      ipcRenderer.send('channel:get:old-messages',{serverId: selectedServerId,channelId: selectedChannelId, type: chnModule.type.chat});
    }

  // Channel Typ ANONCHAT
  }else if(arg.type==chnModule.type.anonchat){

    // Elemente einblenden
    divContentChat.classList.remove('hide');
    txaMessage.classList.remove('hide');
    // Elemente ausblenden
    divContentFiles.classList.add('hide');
    btnFileUpload.classList.add('hide');
    divDatePin.classList.add('hide');

    // Platzhalter im Textfeld ändern
    txaMessage.placeholder = 'Nachricht an @'+arg.name;

    // Event senden um alte Nachrichten zu laden
    ipcRenderer.send('channel:get:old-messages',{serverId: selectedServerId,channelId: selectedChannelId, type: chnModule.type.anonchat});
  }
}

// Enter taste macht neue zeile killme
function onMessageEnterPressed(e){
  if(e.keyCode==13){

    // Setze Typ in Nachricht
    var type;
    if(selectedChannelType == chnModule.type.anonchat){
      type = msgModule.type.anon;
    }else{
      type = msgModule.type.txt;
    }

    // Erstelle Nachricht
    var tmpmsg = new Message(shortid.generate(), type, new Date(), txaMessage.value, userMe.id, selectedChannelId, selectedServerId);

    ipcRenderer.send('server:message:send',tmpmsg);
    txaMessage.value = '';
    return false;
  }
}

// Wird aufgerufen um den aktuell gezeigten Server zu ändern
function serverChanged(newSelectedServer){

  // Alle dynamischen container leeren
  clearServerInterface();

  // Selektierten Server ändern
  var newSelected = document.getElementById('srvObj_'+newSelectedServer);
  newSelected.classList.add('sm-activated');
  var oldSelected = document.getElementById('srvObj_'+selectedServerId);
  oldSelected.classList.remove('sm-activated');

  // Globale Variable ändern
  selectedServerId = newSelectedServer;

  // Gehe durch Server Liste um aktuell selektierten zu finden
  for(var i=0;i<serverDataObject.length;i++){
    if(serverDataObject[i].id === selectedServerId){

      // Speichern um die For Schleife zu sparen wenn das Objekt gebraucht wird
      selectedServerObject = serverDataObject[i];

      // UI erstellen
      setServerTitle(serverDataObject[i].shortName);
      setChannels(serverDataObject[i].channels);
      setServerUserList(serverDataObject[i]);

      selectFirstChannel(serverDataObject[i]);
    }
  }

  getMyCurrentRole();
}

// Selektiert den ersten Channel des Servers, aufgerufen beim start und wenn 
function selectFirstChannel(server){
  selectedChannelId = server.channels[0].childChannels[0];
  channelChanged(selectedChannelId);
}

function handleUploadBtn(){
  ipcRenderer.send('channel:files:upload',{serverId: selectedServerId,channelId: selectedChannelId, userId: userMe.id});
}

/*
//////////////////////////// Helper Functions ////////////////////////////////////////
*/

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}