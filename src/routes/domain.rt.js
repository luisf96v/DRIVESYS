const express = require('express')
const router = express.Router()
const domain = require('../controllers/domain.ctrl')

/*
    Domain Router emulating static routing
*/

// @route GET /
// @desc Displays Main Page
router.get('/', domain.mainPage)

// @route GET /adminUser
// @desc Displays Main Page
router.get('/adminUser', domain.adminUser)

// @route GET /admUsrNav
// @desc Displays Navbar
router.get('/admUsrNav', domain.admUsrNav)

// @route GET /indxUsrNav
// @desc Displays Navbar
router.get('/inxUsrNav', domain.inxUsrNav)

// @route GET /filemanagement
// @desc Displays File Managment Page
router.get('/filemanagement', domain.fileManagement)

// @route GET /dump
// @desc Displays Dump Page
router.get('/dump', domain.dump)

// @route GET /dumpRoot
// @desc Displays Dump Root Page
router.get('/dumpRoot', domain.dumpRoot)

// @route GET /creausuario
// @desc Displays User create
router.get('/creausuario', (_, res) => domain.serveHTML(res, 'creaUsuario.html'))

// @route GET /login
// @desc Displays login Page
router.get('/login', domain.login)

// @route GET /*
// @desc Displays Not Found Page
router.use('*', (_, res) => res.render('error.html'))

module.exports = router