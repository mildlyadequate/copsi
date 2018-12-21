//TODO idk lol

function Message (id, type, timestamp, content, senderId, channelId, serverId) {
    this.id = id,
    this.type = type,  
    this.timestamp = timestamp,
    this.content = content,
    this.senderId = senderId,
    this.channelId = channelId,
    this.serverId = serverId
    /*this.fullName = function() {
        return this.firstName + " " + this.lastName;
    }*/
}

module.exports = {

    Message : Message,

    type : Object.freeze({"txt":1, "img":2, "vid":3, "doc":4})

}