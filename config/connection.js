const mongoClient = require('mongodb').MongoClient;


const state={
    db:null
}

module.exports.connect = function(done){
    const url= 'mongodb://localhost:27017';
    const dbname = 'shoping';
    mongoClient.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true },(err,data)=>{
        if(err) return done(err)
        state.db = data.db(dbname)
        done()
        mongoClient.useUnifiedTopology = true;
    })
    
}

module.exports.get = function(){
    return state.db 
}

