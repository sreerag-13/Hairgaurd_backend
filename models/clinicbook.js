const mongoose = require('mongoose');

const bookClinicSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Referencing User model
        ref: 'user', // Name of the User model
        required: true
    },
    clinicId: {
        type: mongoose.Schema.Types.ObjectId, // Referencing Clinic model
        ref: 'clinic', // Name of the Clinic model
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId, // Referencing Doctorpost model
        ref: 'doctor', // Name of the Doctorpost model
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    clinicName: {
        type: String,
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    slotTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const BookClinicModel = mongoose.model('BookClinic', bookClinicSchema);

module.exports = BookClinicModel