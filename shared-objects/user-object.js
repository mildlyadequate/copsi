// User Objekt
// id:shortid, username:string, nickname:string, password:hash, lastOnline:moment, registered:moment, profilePicture:image, servers:array:serverid
function User (id, username, nickname, password, lastOnline, registered, profilePicture, servers) {
    this.id = id,
    this.username = username,  
    this.nickname = nickname,  
    this.password = password,  
    this.lastOnline = lastOnline,
    this.registered = registered,
    this.profilePicture = profilePicture,
    this.servers = servers
}

module.exports = {

    User : User

}