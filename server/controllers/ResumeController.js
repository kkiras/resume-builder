const { default: mongoose } = require('mongoose');
const Resume = require('../model/Resume')
const cloudinary = require('cloudinary').v2

// Configure Cloudinary once at module load
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

class ResumeController {
    static async createNewResume(req, res) {
        try {
            // const resumeData = req.body;
            const { _id, userId, ...data } = req.body;
            // resumeData.userId = '68f10f356594cb494a29067e'

            if (!userId) return res.status(400).json({ message: "Missing UserID" });

            const newResume = new Resume({ ...data, userId });
            await newResume.save();

            return res.status(201).json({ message: 'Created successfully!' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async duplicate(req, res) {
        try {
            const { _id, userId, ...data } = req.body; //Định nghĩa _id để loại _id cũ
            if (!userId) return res.status(500).json({ message: "Missing UserID" });
            
            const newResume = new Resume({ ...data, userId });
            await newResume.save();

            return res.status(200).json({ 
                message: "Created a duplicate.",
                newResume: newResume
            })

        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    static async saveResume(req, res) {
        try {
            const { _id, userId, ...data } = req.body;

            // Update existing resume by _id
            if (_id) {
                if (!mongoose.Types.ObjectId.isValid(_id)) {
                    return res.status(400).json({ message: 'Invalid resume id' });
                }

                const updated = await Resume.findByIdAndUpdate(
                    _id,
                    { ...data, updatedAt: Date.now() },
                    { new: true }
                );

                if (!updated) {
                    return res.status(404).json({ message: 'Resume not found' });
                }

                return res.status(200).json({ message: 'Updated successfully', resume: updated });
            }

            // Create new resume if no _id provided
            if (!userId) return res.status(400).json({ message: 'Missing UserID' });
            const userObjectId = new mongoose.Types.ObjectId(userId);

            const newResume = new Resume({
                ...data,
                userId: userObjectId,
            });
            await newResume.save();

            return res.status(201).json({ message: 'Saved successfully', resume: newResume });
        } catch (err) {
            console.error('Error saving resume:', err);
            return res.status(500).json({ message: err.message });
        }
    }

    static async getResume(req, res) {
        try {
            // const { userId } = req.params
            const userId = '68f10f356594cb494a29067e'; // ID bạn muốn thử
            const userObjectId = new mongoose.Types.ObjectId(userId);
            // if (mongoose.Types.ObjectId.isValid(userId)) {
                
            //     console.log(userObjectId);
            // } else {
            //     console.log('Invalid ObjectId');
            // }

            const resume = await Resume.findOne({ userId: userObjectId })

            if (!resume) {
                return res.status(404).json({ message: 'Not found' });
            }

            return res.status(200).json({ resume });

        } catch (err) {
            console.error('Error during resume fetching:', err);
            return res.status(500).json({ message: err.message });
        }
    }

    static async getResumeById(req, res) {
        try {
            const userId = '68f10f356594cb494a29067e';
            const userObjectId = new mongoose.Types.ObjectId(userId);

            const resumes = await Resume.find({ userId: userObjectId })
                                        .sort({ createdAt: -1 });

            if (!resumes || resumes.length === 0) {
                return res.status(400).json({ message: "No resume found."});
            }

            return res.status(200).json({ resumes });

        } catch (err) {
            console.error('Error fetching resumes by userId:', err);
            return res.status(500).json({ message: err.message });
        }


    }

    // Uploads a base64/dataURL image to Cloudinary and returns the URL
    static async uploadAvatar(req, res) {
        try {
            const { image } = req.body || {};
            if (!image || typeof image !== 'string') {
                return res.status(400).json({ message: 'Missing image' });
            }

            const folder = process.env.CLOUDINARY_FOLDER || 'resume-avatar';

            const result = await cloudinary.uploader.upload(image, {
                folder,
                resource_type: 'image',
                overwrite: true,
            });

            return res.status(200).json({ url: result.secure_url });
        } catch (err) {
            console.error('Error uploading avatar:', err);
            return res.status(500).json({ message: err.message });
        }
    }

}

module.exports = ResumeController
