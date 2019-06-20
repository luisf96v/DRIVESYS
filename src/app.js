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
    

/*
    Application Settings 
*/
app.set('port', process.env.PORT || 3000)
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
    let userHeader
    if(userHeader = req.headers['user-agent']){
        let {isIE, isMobile} = useragent.parse(userHeader)
        if(isIE || isMobile)
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
app.listen(app.get('port'), ()=> {
    console.log('Server started on port:', app.get('port'))
})
