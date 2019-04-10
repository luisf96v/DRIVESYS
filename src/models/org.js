const mongoose = require('mongoose')
const {Schema} = mongoose

const OrgSchema = new Schema({
    name: { 
        type: String,
        required: true,
        trim: true,
        unique: true,
        max: 35
    },
    host: {
        type: Boolean,
        select: false
    }
})

module.exports = mongoose.model('Org', OrgSchema)