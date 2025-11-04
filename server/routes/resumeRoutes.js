const express = require('express');
const router = express.Router();
const ResumeController = require('../controllers/ResumeController');


// router.get('/get-resume/:userId', ResumeController.getResume);
router.post('/create-resume', ResumeController.createNewResume)

router.get('/get-resume', ResumeController.getResume)

router.post('/save-resume', ResumeController.saveResume)

// Upload avatar (data URL or remote URL); returns Cloudinary URL
router.post('/upload-avatar', ResumeController.uploadAvatar)

router.get('/get-resumes', ResumeController.getResumeById)

router.post('/duplicate', ResumeController.duplicate)



module.exports = router;
