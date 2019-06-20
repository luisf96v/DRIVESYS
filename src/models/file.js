const mongoose = require('mongoose')
const {Schema} = mongoose

const FileSchema = new Schema({
    name: { 
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'folder',
        required: true
    },
    org: {
        type: Schema.Types.ObjectId,
        ref: 'org',
        required: true
    },
    deleted: {
        type: Boolean,
        select: false,
        required: true,
        default: false
    },
}, { versionKey: false })

module.exports = mongoose.model('File', FileSchema)