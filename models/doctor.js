const mongoose=require("mongoose")
const doctorpostchema=mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,
        ref:"Clinic"
    }
    ,DoctorName: [
        {
          type: String,
          required: true
        }
      ],
      qualification: { 
        type: String, 
        required: true, 
        enum: [
          "MBBS + MD (Dermatology)", "MBBS + MD (Trichology)", 
          "Diploma in Dermatology", "Diploma in Trichology", 
          "MSc in Trichology", "Certified Trichologist", 
          "Fellowship in Hair Transplant Surgery", "Cosmetic Dermatology Certification"
        ] 
      },
      specialization: { 
        type: String, 
        required: true, 
        enum: [
          "Dermatology", "Trichology", "Hair Transplant Surgery", 
          "Scalp Treatment", "Hair Loss & Regrowth Therapy", 
          "Alopecia Treatment", "Wig & Hair Prosthesis Consultation", 
          "Laser Hair Therapy"
        ] 
    },
    phone: { type: String, required: true },
    experience: { type: Number, required: true },
    availability: { type: String, required: true },    
      Createddate: {
        type: Date,
        default: Date.now
      }

})
var Doctorpostmodel=mongoose.model("doctorpost",doctorpostchema)
module.exports={Doctorpostmodel}