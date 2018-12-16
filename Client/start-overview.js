// Electron
const electron = require('electron');
const {ipcRenderer,shell,Menu} = electron;

// Server Display Elemente
const divServerUserList = document.getElementById('divServerUserList');

// Variablen
let currentSelectedServer = 'D8kjsp8I4r';

// IPC 


ipcRenderer.on('server:connected',function(e){

  console.log('connected');

});

ipcRenderer.on('user:personal-user-info',function(e,serverData){

  console.log(serverData);

  currentSelectedServer = serverData[0].id;

  // Gehe durch Server Liste um aktuell selektierten zu finden
  for(var i=0;i<serverData.length;i++){
    if(serverData[i].id === currentSelectedServer){
      makeServerUserList(serverData[i]);
    }
  }

});

// FUNCTIONS

function makeServerUserList(currentServerData){
  
console.log(currentServerData);

  // Für Jede Rolle ein Abteil
  for(var i=0;i<currentServerData.roles.length;i++){

    // P Element mit Rollen Name
    var txtRoleLabel = document.createElement('p');
    // Set ID
    txtRoleLabel.classList.add('menu-label');
    txtRoleLabel.innerText = currentServerData.roles[i].name;
    divServerUserList.appendChild(txtRoleLabel);

    // Liste der User mit der aktuellen Rolle
    var ulUsersOfRole = document.createElement('ul');
    // TODO Set ID
    ulUsersOfRole.classList.add('menu-list');
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
    ulUsersOfRole.appendChild(liUser);
  }
}

function createMessage(msg, user){

    var divBox = document.createElement('div');
    divBox.classList.add('box');

    var article = document.createElement('article');
    article.classList.add('media');

    divBox.appendChild(article);

    var divImage = document.createElement('div');
    divImage.classList.add('media-left');

    var figure = document.createElement('figure');
    figure.classList.add('image');
    figure.classList.add('is-64x64');
    divImage.appendChild(figure);

    var image = document.createElement('img');
    image.src=user.profilePicture;
    divImage.appendChild(image);
}
/*
<div class="box">
<article class="media">
  <div class="media-left">
    <figure class="image is-64x64">


    
      <img src="assets/img/placeholder/prof.png" alt="Image">
    </figure>
  </div>
  <div class="media-content">
    <div class="content">
      <p>
        <strong>Dieter Wallach</strong> <small>Professor</small> <small>10d</small>
        <br>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur sit amet massa
        fringilla egestas. Nullam condimentum luctus turpis.
      </p>
    </div>
  </div>
</article>
</div>*/