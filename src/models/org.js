const mongoose = require('mongoose')
const {Schema} = mongoose

const OrgSchema = new Schema({
    name: { 
        type: String,
        required: true,
        max: 45,
        unique: true
    }
})

module.exports = mongoose.model('Org', OrgSchema)