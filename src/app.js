const express = require('express')
    , path = require('path')
    , mongoose = require('./db')
    , morgan = require('morgan')
    , app = express()
    , cookieParser = require('cookie-parser')
    , methodOverride = require('method-override')
    , favicon = require('serve-favicon');

//Settings 
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, '../www/'))
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)

//Middlewares
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(methodOverride('_method'))
app.use(cookieParser('7uM8fMm%uTmQ$aDm@5!T'))
app.use(express.static(path.join(__dirname, '../www/')))
//app.use(express.static(path.join(__dirname, '../html/')))
app.use(favicon(path.join(__dirname, '../www/', 'favicon.ico')))
app.use(morgan('dev')) //delete

//Routes
app.use('/api/folder/', require('./routes/folder.rt'))
app.use('/api/org/', require('./routes/org.rt'))
app.use('/api/user/', require('./routes/user.rt'))
app.use('/api/file/', require('./routes/file.rt'))
app.use('/', require('./routes/domain.rt'))
/*app.get('/', (_, res) => res.render('index.html'))
app.get('/adminRoot',(_, res)=> res.render('adminRoot.html'))
app.get('/adminRootViewOnly',(_, res)=> res.render('adminRootViewOnly.html'))
app.get('/adminUser',(_, res)=> res.render('adminUser.html'))
app.get('/filemanagement', (_, res) => res.render('fileManagement.html'))
app.get('/dump', (_, res) => res.render('dump.html'))
app.get('/dumpRoot', (_, res) => res.render('dumpRoot.html'))
app.get('/creausuario', (_, res) => res.render('creaUsuario.html'))
app.get('/login', (_, res) => res.render('login.html'))
app.use('*', (_, res) => res.render('error.html'))*/


//Starter
app.listen(app.get('port'), ()=> {
    console.log('Server started on port:', app.get('port'))
})
