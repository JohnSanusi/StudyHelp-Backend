import mongoose from 'mongoose';

const uploadedFileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'doc', 'docx', 'txt', 'image'],
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number, // in bytes
        required: true
    },
    extractedText: {
        type: String
    },
    processed: {
        type: Boolean,
        default: false
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

const UploadedFile = mongoose.model('UploadedFile', uploadedFileSchema);

export default UploadedFile;
