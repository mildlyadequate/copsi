// Kombinations Objekt
// id:shortid, shortName:string, name:string, subjectArea:string, user:array:userid, channel:array:userid, roles:roleobjects
function Sur(serverid,userid,roleid) {
    this.serverid = serverid,
    this.userid = userid,
    this.roleid = roleid
}

module.exports = {
    Sur : Sur
}