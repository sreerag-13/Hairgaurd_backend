const express=require("express")
const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const cors=require("cors")
const multer = require("multer")
const jwt=require("jsonwebtoken")
const { usermodel } = require("./models/user")
const ClinicModel = require("./models/clinic")
const { Doctorpostmodel } = require("./models/doctor")

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
          // Hash the password
          const hashedPassword = bcrypt.hashSync(input.password, 10);
          input.password = hashedPassword;
  
          // Check if the email already exists
          const existingClinic = await ClinicModel.findOne({ email: input.email });
          if (existingClinic) {
              return res.json({ status: "email already exists" });
          }
  
          // Assign the uploaded image path
          if (req.file) {
              input.image = `/uploads/clinicImages/${req.file.filename}`;
          }
  
          // Create and save the new clinic
          const newClinic = new ClinicModel(input);
          await newClinic.save();
  
          // Generate JWT token
          const token = jwt.sign({ email: input.email }, "HairClinicApp", { expiresIn: "1d" });
  
          // Respond to the client
          res.json({ status: "success", token, imageUrl: input.image });
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

  app.listen(3031,()=>{
    console.log("server started ")
})