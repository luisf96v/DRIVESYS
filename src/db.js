//Data base file initialization
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://127.0.0.1:27017/drive', { useNewUrlParser: true , useFindAndModify: false })
    .then(() => console.log('Sucessfully connected to Mongo DB.'))
    .catch(e => console.error('Database Not Connected: ', e));
//mongodb+srv://admin:docsys@docsys-fbavo.mongodb.net/test?retryWrites=true&w=majority

module.exports = mongoose;