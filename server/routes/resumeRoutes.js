const express = require('express');
const router = express.Router();
const ResumeController = require('../controllers/ResumeController');
const auth = require('../middlewares/auth');


// router.get('/get-resume/:userId', ResumeController.getResume);
router.post('/create-resume', auth, ResumeController.createNewResume)

// router.get('/get-resume', ResumeController.getResume)

router.post('/save-resume', auth, ResumeController.saveResume)

// Upload avatar (data URL or remote URL); returns Cloudinary URL
router.post('/upload-avatar', ResumeController.uploadAvatar)

router.get('/get-resumes', auth, ResumeController.getResumesByUserId)

router.post('/duplicate', auth, ResumeController.duplicate)

// Delete a resume by id
router.delete('/:id', auth, ResumeController.deleteResume)



module.exports = router;
