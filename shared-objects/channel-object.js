// Channel Objekt
// id:shortid, name:string, type:enum, messages:array, roleAbility:Object
function Channel(id, name, type, messages, roleAbility) {
    this.id = id,
    this.name = name,
    this.type = type,
    this.messages = messages,
    this.roleAbility = roleAbility
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
    type : Object.freeze({"chat":1, "news":2, "document":3})
}