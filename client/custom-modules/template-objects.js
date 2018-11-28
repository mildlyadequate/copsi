module.exports = {

    getDummyChannel

    getDummyClass: function () {
        var classMod = require('../shared-objects/class-object.js');  
        var Class = classMod.Class;
        var dummyClass = new Class('testClassID','Test Class #1','IMST',[],[]);
        return dummyClass;
    }
  };