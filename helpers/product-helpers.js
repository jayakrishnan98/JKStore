var db= require("../config/connection").get

module.exports={

    addProduct:(product, callback)=>{
        db.collection('product').insertOne(product).then((data)=>{
            callback(data.ops[0]._id)
            
        })
    }
}