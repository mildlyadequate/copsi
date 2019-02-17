function ChannelMessages (serverId, channelId, messages) {
    this.channelId = channelId,
    this.serverId = serverId,
    this.messages = messages
}

module.exports = {

    ChannelMessages : ChannelMessages

}