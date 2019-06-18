const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/file.ctrl')

router.post('/upload/:folder', ctrl.upload.array('files'), (req, res)=> {
    res.sendStatus(200)
});
router.get('/:fileId', ctrl.getFileStream);
  
module.exports = router