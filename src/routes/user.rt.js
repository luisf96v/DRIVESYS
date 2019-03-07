const express = require('express')
const router = express.Router()

const ctrl = require('../controllers/user.ctrl')

router.post('/login', ctrl.findLogin)
router.post('/', ctrl.insert)
router.get('/', ctrl.findAll)

module.exports = router