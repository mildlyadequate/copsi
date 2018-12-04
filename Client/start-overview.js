// Electron
const electron = require('electron');
const {ipcRenderer,shell,Menu} = electron;

var divServerUserList = document.getElementById('divServerUserList');

// IPC 

ipcRenderer.on('user:personal-user-info',function(e,serverData){



});

// FUNCTIONS

function makeServerUserList(){
  
  // Für Jede Rolle ein Abteil
  for(){

    // P Element mit Rollen Name

    // User Liste in der ROlle
    for(){

    }

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
</div>