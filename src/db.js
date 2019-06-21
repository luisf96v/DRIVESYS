//Data base file initialization
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb+srv://admin:docsys@docsys-fbavo.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true , useFindAndModify: false })
    .then(() => console.log('Sucessfully connected to Mongo DB.'))
    .catch(e => console.error('Database Not Connected: ', e));
module.exports = mongoose;