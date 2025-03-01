const express=require("express")
const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const cors=require("cors")
const multer = require("multer")
const jwt=require("jsonwebtoken")
const { usermodel } = require("./models/user")
const ClinicModel = require("./models/clinic")
const { Doctorpostmodel } = require("./models/doctor")
const BookClinicModel = require("./models/clinicbook")  
const ProductCompanyModel = require("./models/Product")

let app=express();
app.use(cors());
app.use(express.json());


mongoose.connect("mongodb+srv://sreerag:sreerag@cluster0.onuj57g.mongodb.net/Haigaurddb?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store images in 'uploads/clinicImages' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname); // Unique filename
    },
});

  app.post("/usersignup", async (req, res) => {
    const input = req.body;
  
    try {
      // Hash the password
      const hashedPassword = bcrypt.hashSync(input.Password, 10);
      input.Password = hashedPassword;
  
      // Check if the email already exists
      const existingUser  = await usermodel.findOne({ Email: input.Email });
      if (existingUser ) {
        return res.json({ status: "email already exists" });
      }
  
      // Create and save the new user
      const newUser  = new usermodel(input);
      await newUser .save();
  
      // Generate JWT token
      const token = jwt.sign({ Email: input.Email }, "User App", { expiresIn: "1d" });
  
      // Log the token in the terminal
      console.log("JWT Token:", token);
  
      // Respond to the client
      res.json({ status: "success", token });
    } catch (error) {
      console.error("Error saving user:", error);
      res.json({ status: "error", message: error.message });
    }
  });



  app.post("/signin", (req, res) => {
    let input = req.body;

    usermodel.findOne({ "Email": input.Email }).then((user) => {
        if (user) {
            const dpassword = bcrypt.compareSync(input.Password, user.Password);
            if (dpassword) {
                jwt.sign({ Email: input.Email }, "HairApp", { expiresIn: "1d" }, (error, token) => {
                    if (error) {
                        res.json({ "status": "error", "errorMessage": error });
                    } else {
                        res.json({ 
                            "status": "success", 
                            "token": token, 
                            "user": user // Send full user details
                        });
                    }
                });
            } else {
                res.json({ "status": "incorrect password" });
            }
        } else {
            res.json({ "status": "incorrect email" });
        }
    }).catch(err => {
        res.json({ "status": "error", "errorMessage": err.message });
    });
});

  const upload = multer({ storage: storage });

  // Serve static files (to access uploaded images)
  app.use("/uploads", express.static("uploads"));
  
  // Clinic Signup API
  app.post("/clinic-signup", upload.single("image"), async (req, res) => {
    const input = req.body;

    try {
        const hashedPassword = bcrypt.hashSync(input.password, 10);
        input.password = hashedPassword;

        const existingClinic = await ClinicModel.findOne({ email: input.email });
        if (existingClinic) {
            return res.json({ status: "email already exists" });
        }

        // Ensure correct image path
        if (req.file) {
            input.image = `/uploads/${req.file.filename}`; // Corrected
        }

        const newClinic = new ClinicModel(input);
        await newClinic.save();

        const token = jwt.sign({ email: input.email }, "HairClinicApp", { expiresIn: "1d" });

        res.json({ status: "success", token, clinic: newClinic });
    } catch (error) {
        console.error("Error saving clinic:", error);
        res.json({ status: "error", message: error.message });
    }
});

  app.post("/clinic-signin", async (req, res) => {
    try {
        let input = req.body;

        // Find the clinic by email
        let clinic = await ClinicModel.findOne({ email: input.email });

        if (!clinic) {
            return res.json({ status: "incorrect email" });
        }

        // Check password
        const passwordMatch = bcrypt.compareSync(input.password, clinic.password);
        if (!passwordMatch) {
            return res.json({ status: "incorrect password" });
        }

        // Generate JWT token
        const token = jwt.sign({ email: clinic.email, id: clinic._id }, "HairClinicApp", { expiresIn: "1d" });

        // Extract only the filename from the image path
        const imageFilename = clinic.image.split("/").pop(); // Extracts "image1" from "/uploads/image1"

        // Send full clinic details with token
        res.json({ status: "success", token, clinic: { ...clinic._doc, image: imageFilename } });

    } catch (error) {
        console.error("Login Error:", error);
        res.json({ status: "error", message: error.message });
    }
});
app.post("/company-signup", upload.single("brandLogo"), async (req, res) => {
    try {
        const input = req.body;

        // ✅ Hash password before saving
        const hashedPassword = bcrypt.hashSync(input.password, 10);
        input.password = hashedPassword;

        // ✅ Check if the company email already exists
        const existingCompany = await ProductCompanyModel.findOne({ email: input.email });
        if (existingCompany) {
            return res.json({ status: "email already exists" });
        }

        // ✅ Ensure correct image path
        if (req.file) {
            input.brandLogo = `/uploads/brandLogos/${req.file.filename}`;
        }

        // ✅ Create and save new company
        const newCompany = new ProductCompanyModel(input);
        await newCompany.save();

        // ✅ Generate JWT token
        const token = jwt.sign({ email: input.email, id: newCompany._id }, "ProductCompanySecretKey", { expiresIn: "1d" });

        res.json({ status: "success", token, company: newCompany });
    } catch (error) {
        console.error("Error saving company:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
});
app.post("/company-login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const company = await ProductCompanyModel.findOne({ email });
        if (!company) {
            return res.json({ status: "incorrect email" });
        }

        const passwordMatch = bcrypt.compareSync(password, company.password);
        if (!passwordMatch) {
            return res.json({ status: "incorrect password" });
        }

        const token = jwt.sign({ email: company.email, id: company._id }, "ProductCompanySecretKey", { expiresIn: "1d" });

        // Prepend base URL to brandLogo for consistency
        const fullBrandLogo = `http://localhost:3031${company.brandLogo}`;

        res.json({ 
            status: "success", 
            token, 
            company: { ...company._doc, brandLogo: fullBrandLogo } 
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
});
app.get('/viewallclinics', async (req, res) => {
    try {
        const clinics = await ClinicModel.find({});
        const baseUrl = "http://localhost:3031"; // Ensure your frontend uses this

        const updatedClinics = clinics.map(clinic => ({
            ...clinic.toObject(),
            image: clinic.image ? `${baseUrl}${clinic.image}` : null
        }));

        res.json({ status: "success", data: updatedClinics });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.post("/add-doctor", async (req, res) => {
    try {
        const token = req.header("Authorization");
        if (!token) {
            return res.status(401).json({ status: "error", message: "Access Denied: No Token Provided" });
        }

        // Verify Token
        const decoded = jwt.verify(token, "HairClinicApp");
        const clinicId = decoded.id; // Get Clinic ID from token

        // Check if the clinic exists
        const clinic = await ClinicModel.findById(clinicId);
        if (!clinic) {
            return res.status(404).json({ status: "error", message: "Clinic not found" });
        }

        // Get doctor details from request body
        const { DoctorName, qualification, specialization, phone, experience, availability } = req.body;

        // Create a new doctor post linked to the clinic
        const newDoctor = new Doctorpostmodel({
            userId: clinicId,
            DoctorName,
            qualification,
            specialization,
            phone,
            experience,
            availability,
            Createddate: new Date()
        });

        // Save to database
        await newDoctor.save();
        res.json({ status: "success", message: "Doctor added successfully", doctor: newDoctor });

    } catch (error) {
        console.error("Error adding doctor:", error);

        // Handle JWT errors
        if (error.name === "JsonWebTokenError") {
            return res.status(400).json({ status: "error", message: "Invalid Token" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ status: "error", message: "Token Expired" });
        }

        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
});
app.get("/clinic/:id", async (req, res) => {
    try {
        const clinic = await ClinicModel.findById(req.params.id);
        if (!clinic) {
            return res.status(404).json({ status: "error", message: "Clinic not found" });
        }

        // ✅ Fix Image Path
        const baseUrl = "http://localhost:3031"; // Change this to your actual backend URL
        clinic.image = clinic.image?.startsWith("/") ? `${baseUrl}${clinic.image}` : clinic.image;

        res.json({ status: "success", data: clinic });
    } catch (error) {
        console.error("Error fetching clinic:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
});
app.get("/clinic/:id/doctors", async (req, res) => {
    try {
        const clinicId = req.params.id;
        const doctors = await Doctorpostmodel.find({ userId: clinicId });

        if (!doctors || doctors.length === 0) {
            return res.json({ status: "success", message: "No doctors found for this clinic", data: [] });
        }

        res.json({ status: "success", data: doctors });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
});
app.post("/api/bookings/book", async (req, res) => {
    try {
        const { userId, clinicId, doctorId, userName, clinicName, doctorName, bookingDate, slotTime } = req.body;

        // Validate required fields
        if (!userId || !clinicId || !doctorId || !userName || !clinicName || !doctorName || !bookingDate || !slotTime) {
            return res.status(400).json({ status: "error", error: "All fields are required" });
        }

        // Validate MongoDB ObjectIds
        if (!mongoose.Types.ObjectId.isValid(userId) || 
            !mongoose.Types.ObjectId.isValid(clinicId) || 
            !mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ status: "error", error: "Invalid ID format" });
        }

        // Parse bookingDate as date-only (YYYY-MM-DD)
        const bookingDateObj = new Date(bookingDate);
        if (isNaN(bookingDateObj.getTime())) {
            return res.status(400).json({ status: "error", error: "Invalid booking date" });
        }
        // Set time to 00:00:00 UTC to store only date
        bookingDateObj.setUTCHours(0, 0, 0, 0);

        // Check for existing booking with exact date and slot
        const existingBooking = await BookClinicModel.findOne({
            doctorId: new mongoose.Types.ObjectId(doctorId),
            bookingDate: bookingDateObj,
            slotTime: slotTime
        });

        if (existingBooking) {
            return res.status(400).json({ 
                status: "error", 
                error: "This time slot is already booked for this doctor on this date" 
            });
        }

        // Save the new booking with date-only values
        const newBooking = new BookClinicModel({
            userId: new mongoose.Types.ObjectId(userId),
            clinicId: new mongoose.Types.ObjectId(clinicId),
            doctorId: new mongoose.Types.ObjectId(doctorId),
            userName,
            clinicName,
            doctorName,
            bookingDate: bookingDateObj,
            slotTime,
            createdAt: new Date().setUTCHours(0, 0, 0, 0) // Override default to date-only
        });

        const savedBooking = await newBooking.save();
        res.status(201).json({ 
            status: "success", 
            message: "Booking successful", 
            booking: savedBooking 
        });

    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ status: "error", error: "Internal Server Error: " + error.message });
    }
});
  app.listen(3031,()=>{
    console.log("server started ")
})