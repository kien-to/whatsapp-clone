import mongoose from 'mongoose'

const gpkSchema = mongoose.Schema({
    message: String,
    name: String, 
    timestamp: String,
    received: Boolean,
});


export default mongoose.model('messagecontents', gpkSchema)