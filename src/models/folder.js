const mongoose = require('mongoose')
const {Schema} = mongoose

const FolderSchema = new Schema({
    name: { 
        type: String,
        required: true,
        max: 30,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        select: false
    },
    org: {
        type: Schema.Types.ObjectId,
        ref: 'Org',
        select: false
    },
    deleted: {
        type: Boolean,
        select: false,
        required: true,
        default: false
    }
}, { versionKey: false })

module.exports = mongoose.model('Folder', FolderSchema)