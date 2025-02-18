const express=require("express")
const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const cors=require("cors")
const jwt=require("jsonwebtoken")
const { usermodel } = require("./models/user")

let app=express();
app.use(cors());
app.use(express.json());
mongoose.connect("mongodb+srv://sreerag:sreerag@cluster0.onuj57g.mongodb.net/Haigaurddb?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

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



app.post("/signin",(req,res)=>{
  let input=req.body
  usermodel.find({"Email":req.body.Email}).then((response)=>{
    if(response.length>0)
      {
         const dpassword=bcrypt.compareSync(input.Password,response[0].Password)
          if(dpassword)
              {
                  jwt.sign({Email:input.Email},"HairApp",{expiresIn:"1d"},(error,token)=>{
                      if(error)
                      {
                          res.json({"status":"eroor","errorMessage":error}) 
                      }
                      else{
                          res.json({"status":"success","token":token,"userid":response[0]._id})
                      }
                  })
                 
              }
              else{
                  res.json({"status":"incorrect password"})
              }
          }
      else{
          res.json({"status":"incorrect email"})
      }
  }
  )
  .catch()
  }
  )
  app.listen(3031,()=>{
    console.log("server started ")
})