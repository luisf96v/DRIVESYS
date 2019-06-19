const mongoose = require('mongoose')
const {Schema} = mongoose

const FileSchema = new Schema({
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