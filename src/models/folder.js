const mongoose = require('mongoose')
const {Schema} = mongoose

const FolderSchema = new Schema({
    name: { 
        type: String,
        required: true,
        max: 30,
        trim: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Folder'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        select: false
    },
    activity:{
        type: Integer,
        default: 1,
        max: 3,
        min: 1,
        select: false
        /*
            Activity explation:
            1: Created
            2: Edited
            3: Deleted
        */
    },
    date: {
        type: Date,
        default: Date.now(),
        select: false
    },
    org: {
        type: Schema.Types.ObjectId,
        ref: "Org",
        required: true
    }
}).index({name: 1, parent: 1}, {unique: true})

module.exports = mongoose.model('Folder', FolderSchema)