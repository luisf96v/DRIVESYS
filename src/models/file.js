const mongoose = require('mongoose')
const {Schema} = mongoose

const FileSchema = new Schema({
    name: {
        type: String,
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
        type: Boolean
    },
})

module.exports = mongoose.model('File', FileSchema)