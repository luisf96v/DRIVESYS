const express = require('express')
const router = express.Router()

const ctrl = require('../controllers/org.ctrl')

router.get('/:id', ctrl.find)
//router.get('/:id/drive', ctrl.findFolder)
//router.get('/:id/users', ctrl.findUsers)
//router.get('/all', ctrl.findAll)
router.post('/', ctrl.insert)
//router.post('/update', ctrl.update)


module.exports = router