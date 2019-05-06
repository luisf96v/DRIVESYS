const mongoose = require('mongoose')
const {Schema} = mongoose

const FolderSchema = new Schema({
    name: { 
        type: String,
        required: true,
        max: 30,
        trim: true,
        uppercase: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Folder'
    },
    org: {
        type: Schema.Types.ObjectId,
        ref: 'Org',
        select: false
    }
})

module.exports = mongoose.model('Folder', FolderSchema)