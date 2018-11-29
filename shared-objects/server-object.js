// Server Objekt
// id:shortid, shortName:string, name:string, subjectArea:string, user:array:userid, channel:array:userid, roles:roleobjects
function Server(id, shortName, name, subjectArea, user, channel, roles) {
    this.id = id,
    this.shortName = shortName,
    this.name = name,
    this.subjectArea = subjectArea,
    this.user = user,
    this.channel = channel,
    this.roles = roles
}


module.exports = {
    Server : Server
}