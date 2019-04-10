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
        inmutable: true,
    },
    root: {
        type: Schema.Types.ObjectId,
        ref: "Folder",
        required: true,
        select: false,
        inmutable: true
    },
    dump: {
        type: Schema.Types.ObjectId,
        ref: "Folder",
        required: true,
        select: false,
        inmutable: true
    }
})

module.exports = mongoose.model('Org', OrgSchema)