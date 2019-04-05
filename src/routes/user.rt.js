const express = require('express')
const router = express.Router()

const ctrl = require('../controllers/user.ctrl')

router.get('/', ctrl.findLogin)
router.post('/', ctrl.insert)
router.get('/all', ctrl.findAll)

module.exports = router