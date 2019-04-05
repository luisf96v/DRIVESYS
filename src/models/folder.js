const mongoose = require('mongoose')
const {Schema} = mongoose

const FolderSchema = new Schema({
    name: { 
        type: String,
        required: true,
        max: 30,
        trim: true
    },
    node: {
        type: Schema.Types.Carpet,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activity:{
        type: Integer,
        default: 0,
        max: 2,
        min: 0 
    },
    date: {
        type: Date,
        default: Date.now
    }
}).index({name: 1, node: 1}, {unique: true})

module.exports = mongoose.model('Folder', FolderSchema)