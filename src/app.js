/*
    App JS
    Central Module for DOCSYS project.

    Repository: https://github.com/luisf96v/DRIVESYS

    Created By:
        - Luis Vásquez. Mail: luif96v@gmail.com. Github: luisf96v
        - Walther Chavez. Mail: ps3.walther@gmail.com. Github: banned007
    Created On: 19, June, 2019

    All rigths reserved, Copyrigth 2019.
    
    Any use of this code is prohibited without first having contacted both authors 
    and have their permission to modify, distribute, execute, reference or sell the code.
*/
global.__MONGO_USER = process.env.musr || ''
global.__MONGO_PASS = process.env.mpwd || ''

const express = require('express')
    , app = express()
    , path = require('path')
    , mongoose = require('./db')
    , morgan = require('morgan') //delete
    /* Module for parsing cookies and having signed cookies. */
    , cookieParser = require('cookie-parser')
    /* Module for detecting user data, browser, version, OS, etc. */
    , useragent = require('express-useragent')
    /* Module for limiting user rquest per ms, middleware for DDOS*/
    , rateLimit = require('express-rate-limit')
    //, session = require('express-session')
    /* Helmet helps Express apps by setting various HTTP headers.
        Enabled options:
            - DNS Prefetch Control: https://helmetjs.github.io/docs/dns-prefetch-control/
            - Frameguard: https://helmetjs.github.io/docs/frameguard/
            - Hide Powered-By: https://helmetjs.github.io/docs/hide-powered-by/
            - HSTS: https://helmetjs.github.io/docs/hsts/
            - IE No Open: https://helmetjs.github.io/docs/ienoopen/
            - Don't Sniff Mimetype: https://helmetjs.github.io/docs/dont-sniff-mimetype/
            - XSS Filter: https://helmetjs.github.io/docs/xss-filter/
    */
    , helmet = require('helmet') 
    , methodOverride = require('method-override')
    , favicon = require('serve-favicon')
    , fs = require('fs')
    , https = require('https')

/*
    Application Settings 
*/
app.set('port', process.env.port || 3000)
app.set('views', path.join(__dirname, '../www/'))
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)

/*
    Middlewares
*/
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(methodOverride('_method'))
app.use(cookieParser('7uM8fMm%uTmQ$aDm@5!T'))
/*app.use(expressSession({
    secret: '7uM8fMm%uTmQ$aDm@5!T',
    resave: false,
    saveUninitialized: true//,
    cookie: {
      secureProxy: true,
      httpOnly: true,
      domain: 'example.com',
      expires: expiryDate
    }
}))*/
app.use(express.static(path.join(__dirname, '../www/')))
app.use(favicon(path.join(__dirname, '../www/', 'favicon.ico')))
app.use(useragent.express())
app.use(helmet())
app.use('/api/*', rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 300, 
    message: "Muchas conexiadas creadas desde este IP, por favor intenta en 15 minutos hora."
  }))
app.use(morgan('dev')) //delete

/*
    Routes Configuration
*/
app.all('*', async (req, res, next) => {
    if(req.protocol === 'http' && global.__HTTPS)
        res.redirect("https://" + req.headers.host + req.url)
    else next()
})

app.all('*', async (req, res, next) => {
    let userHeader
    if(userHeader = req.headers['user-agent']){
        let {isIE} = useragent.parse(userHeader)
        if(isIE)
            return res.redirect('/browserNotSupported.html') 
    }
    next()
})
const User = require('./models/user')
app.all('/api/*', async (req, res, next) => {
        if(req.originalUrl.match('/api/user/auth*') || (req.method == 'POST' && req.originalUrl.match('/api/org')))
            return next()

        let usr = await User.findOne({_id: req.signedCookies.muid}, {type: 1, passr: 1, org: 1})
                    .lean()
                    .populate('org', {enabled: 1})
        
        if(usr && !usr.passr && usr.org && usr.org.enabled)
            return next()
        
        res.cookie("muid", "", { maxAge: 0, overwrite: true})
        res.cookie("ouid", "", { maxAge: 0, overwrite: true})
        return res.redirect('/login')
})

/*
    Routes Path
*/
app.use('/api/folder/', require('./routes/folder.rt'))
app.use('/api/org/', require('./routes/org.rt'))
app.use('/api/user/', require('./routes/user.rt'))
app.use('/api/file/', require('./routes/file.rt'))
app.use('/', require('./routes/domain.rt'))


/*
    Initializing Application
*/
try {
    const privateKey = fs.readFileSync('/home/ubuntu/certs/private.key', 'utf8')
    const certificate = fs.readFileSync('/home/ubuntu/certs/certificate.crt', 'utf8')
    const credetials = {key: privateKey, cert: certificate}
    if(credetials.key && credetials.cert){
        global.__HTTPS = true
        const server = https.createServer({key: privateKey, cert: certificate}, app)
        server.listen(app.get('port'), ()=>{
            console.log('HTTPS (*) server up on port: '+app.get('port'))
            console.log('Credentials found and initializated.')
        })
    } else {
        app.listen(app.get('port'), ()=> {
            console.log('HTTP Server started on port: ', app.get('port'), '.')
            console.log('Could not found credentials under path : /home/ubuntu/certs')
        })
    }
} catch(err){
    app.listen(app.get('port'), ()=> {
        console.log('HTTP Server started on port: ', app.get('port'), '.')
        console.log('Could not found credentials under path : /home/ubuntu/certs')
    })
}
