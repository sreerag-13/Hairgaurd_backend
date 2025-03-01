const mongoose = require("mongoose");

const productCompanySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    brandLogo: {
        type: String, // Image URL of the brand logo
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    aboutCompany: {
        type: String
    },
    establishedYear: {
        type: Number
    },
    companyType: {
        type: String,
        enum: ["Manufacturer", "Distributor", "Retailer"],
        required: true
    }
});

const ProductCompanyModel = mongoose.model("ProductCompany", productCompanySchema);
module.exports = ProductCompanyModel;
