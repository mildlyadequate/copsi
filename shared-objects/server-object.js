function Server(id, name, subjectArea, user, channel) {
    this.id = id,
    this.name = name,
    this.subjectArea = subjectArea,
    this.user = user,
    this.channel = channel
}

module.exports = {
    Server : Server
}