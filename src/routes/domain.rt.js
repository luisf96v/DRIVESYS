const express = require('express')
const router = express.Router()

const domain = require('../controllers/domain.ctrl')

router.get('/', domain.mainPage)
router.get('/adminUser', domain.adminUser)
router.get('/admUsrNav', domain.admUsrNav)
router.get('/filemanagement', domain.fileManagement)
router.get('/dump', domain.dump)
router.get('/dumpRoot', domain.dumpRoot)
router.get('/creausuario', (_, res) => res.render('creaUsuario.html'))
router.get('/login', domain.login)
router.use('*', (_, res) => res.render('error.html'))

module.exports = router