const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EducationItemSchema = new Schema({
    id: String,
    schoolName: String,
    major: String,
    degree: String,
    GPA: String,
    start: String,
    end: String,
    description: [String],
}, {_id: false});

const ExperienceItemSchema = new Schema({
    id: String,
    company: String,
    position: String,
    period: String,
    jobResponse: [String],

}, {_id: false});

const ProjectItemSchema = new Schema({
    id: String,
    name: String,
    role: String,
    link: String,
    period: String,
    description: [String],
}, {_id: false});

const SectionSchema = new Schema({
    id: String,
    kind: String,
    title: String,
    items: {
        type: [Schema.Types.Mixed],
        required: true
    }
}, {_id: false});

const BasicSchema = new Schema({
    avatar: String,
    name: String,
    title: String,
    email: String,
    location: String,
    phone: String,
    employ: String,
}, {_id: false});

// Styles for resume rendering (typography/theme)
const StylesSchema = new Schema({
    textColor: { type: String, default: '#313131' },
    contentFontSize: { type: String, default: '14px' },
    titleFontSize: { type: String, default: '24px' },
    subTitleFontSize: { type: String, default: '16px' },
    lineHeight: { type: Number, default: 1.5 },
}, { _id: false });

// Share schema for public/link sharing
const ShareSchema = new Schema({
    token: { type: String, index: true, sparse: true, unique: true },
    enabled: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    lastRotatedAt: { type: Date, default: null },
}, { _id: false });

const ResumeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    name: { type: String, required: false, default: '' },

    basics: BasicSchema,

    sections: [SectionSchema],

    // Persisted style settings
    styles: { type: StylesSchema, default: () => ({}) },

    // Visibility: private | public | link (default private)
    visibility: { type: String, enum: ['private', 'public', 'link'], default: 'private' },
    share: { type: ShareSchema, default: () => ({}) },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

ResumeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Resume', ResumeSchema);

