var db= require("../config/connection")
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectID
const { ObjectID } = require("mongodb")

module.exports={

    addProduct:(product, callback)=>{
        db.get().collection('product').insertOne(product).then((data)=>{
            callback(data.ops[0]._id)

        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(proID)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:ObjectID(proID)}).then((response)=>{
                resolve(response)
            })
        })
    }
}