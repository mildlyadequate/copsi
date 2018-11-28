function User (id, nickname, lastOnline, registered, profilePicture, servers) {
    this.id = id,
    this.nickname = nickname,  
    this.lastOnline = lastOnline,
    this.registered = registered,
    this.profilePicture = profilePicture,
    this.servers = servers
}

module.exports = {

    User : User

}