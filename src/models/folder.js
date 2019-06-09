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
        required: false,
        select: false
    }
}, { versionKey: false })

FolderSchema.index({name: 1, parent: 1}, {unique: true})

module.exports = mongoose.model('Folder', FolderSchema)