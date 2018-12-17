// Channel Objekt
// id:shortid, name:string, type:enum, messages:array:messages, isCategory:boolean, roleAbility:Object, childChannels:array:channels
function Channel(id, name, type, messages, isCategory, picture, roleAbility, childChannels) {
    this.id = id,
    this.name = name,
    this.type = type,
    this.messages = messages,
    this.isCategory = isCategory,
    this.picture = picture,
    this.roleAbility = roleAbility,
    this.childChannels = childChannels
}

// RoleAbility Objekt
// read:array, write:array, fileupload:array, manageMsgs:array
function RoleAbility(read, write, fileupload, manageMsgs) {
    this.read = read,
    this.write = write,
    this.fileupload = fileupload,
    this.manageMsgs = manageMsgs
}

module.exports = {
    Channel : Channel,
    RoleAbility : RoleAbility,

    // Lege alle möglichen Typen von Channels fest
    type : Object.freeze({"chat":1, "news":2, "doc":3})
}