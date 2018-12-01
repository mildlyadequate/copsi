// Server Objekt
// id:shortid, shortName:string, name:string, subjectArea:string, user:array:userid, channel:array:userid, roles:roleobjects
function Server(id, shortName, password, name, subjectArea, user, channel, roles, userAbility) {
    this.id = id,
    this.shortName = shortName,
    this.password = password,
    this.name = name,
    this.subjectArea = subjectArea,
    this.user = user,
    this.channel = channel,
    this.roles = roles,
    this.userAbility = userAbility
}

// UserAbility Objekt
// admin:array, moderator:array, announcement:array
function UserAbility(admin,moderator,announcement) {
    this.admin = admin,
    this.moderator = moderator,
    this.announcement = announcement
}


module.exports = {
    Server : Server,
    UserAbility : UserAbility
}