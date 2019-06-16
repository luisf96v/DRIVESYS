const mongoose = require('mongoose')
const {Schema} = mongoose

const FileSchema = new Schema({
    name: { 
        type: String,
        required: true,
        max: 35,
        trim: true
    },
    node: {
        type: Schema.Types.Carpet,
        required: true
    },
    user: {
        type: Schema.Types.User,
        required: true
    },
    activity:{
        type: Boolean,
        default: false 
    },
    date: {
        type: Date,
        default: Date.now
    },
    fid: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

module.exports = mongoose.model('File', FileSchema)