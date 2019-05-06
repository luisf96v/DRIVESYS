const mongoose = require('mongoose')
const {Schema} = mongoose

const OrgSchema = new Schema({
    name: { 
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        max: 35
    },
    host: {
        type: Boolean,
        select: false,
        immutable: true,
    },
    root: {
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        required: true,
        select: false,
        immutable: true
    },
    dump: {
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        required: true,
        select: false,
        immutable: true
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        select: false
    }
})
OrgSchema.plugin(require('mongoose-immutable'))

module.exports = mongoose.model('Org', OrgSchema)