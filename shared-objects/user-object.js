function User (id, username, password, lastOnline, registered, profilePicture, servers) {
    this.id = id,
    this.username = username,  
    this.password = password,  
    this.lastOnline = lastOnline,
    this.registered = registered,
    this.profilePicture = profilePicture,
    this.servers = servers
}

module.exports = {

    User : User

}