const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
    clinicName: { type: String, required: true }, 
    email: { type: String, required: true, unique: true }, // Clinic Email (Unique)
    password: { type: String, required: true }, // Encrypted Password
    phone: { type: String, required: true }, // Contact Number
    address: { type: String, required: true }, // Clinic Address
    state: { type: String, required: true }, // State
    city: { type: String, required: true }, // City
    licenseNumber: { type: String, required: true, unique: true }, // Medical License Number
    experienceYears: { type: Number, required: true }, // Years of Experience
    description: { type: String }, // Short Description of the Clinic
    image: { type: String }, // Clinic Image / Logo (URL)

});

const ClinicModel = mongoose.model('Clinic', clinicSchema);
module.exports = ClinicModel;
