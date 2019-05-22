const mongoose = require('mongoose')
const {Schema} = mongoose

const OrgSchema = new Schema({
    name: { 
        type: String,
        required: true,
        trim: true,
        unique: true,
        uppercase: true,
        max: 35
    },
    host: {
        type: Boolean,
        select: false
    },
    enabled: {
        type: Boolean,
        select: false,
        default: true,
        required: true
    },
    root: {
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        required: true,
        select: false
    },
    dump: {
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        required: true,
        select: false
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        select: false
    }
}, { versionKey: false })

OrgSchema.plugin(require('mongoose-immutable'))
module.exports = mongoose.model('Org', OrgSchema)