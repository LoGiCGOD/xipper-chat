const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({

sender_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
},
receiver_id:{
    type:mongoose.Schema.Types.ObjectId,  //sender and receiver are both users
    ref:'User'
},
message:{
    type:String,
    ref:'User'
},

},
{timestamps:true}
);

module.exports = mongoose.model('Chat',chatSchema)