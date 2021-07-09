const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const https = require("https");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-amit:Test-123@cluster0.kxfkn.mongodb.net/blogDB" , {useNewUrlParser:true});

var springedge = require('springedge')

const clientSchema = new mongoose.Schema({
  Fname : String,
  Mname : String,
  Lname : String,
  Email : String,
  Password : String,
  DOB : String,
  Education : String,
  Address : String,
  PinCode : Number,
  City : String,
  State : String,
  Country : String,
  Mobile : Number
});

const Client = mongoose.model("Client",clientSchema);

app.get("/" , function(req,res) {
    res.render("home");
});

app.get("/signup" , function(req,res) {
    res.render("signup");
})

app.post("/signup", function(req,res) {
    

    if(req.body.password === req.body.cnfpassword){
      //saving the data of new client  
       const newClient  = new Client({
        Fname : req.body.FirstName,
        Mname : req.body.MiddleName,
        Lname : req.body.LastName,
        Email : req.body.email,
        Password : req.body.password,
        DOB : req.body.birthday,
        Education : req.body.Education,
        Address : req.body.Address,
       });
      
       newClient.save();
      
      //send to mobile verification page
         res.render("verification", {Email : req.body.email});
    } else {
         res.redirect("/signup" , );
    }
})

app.get("/verification", function(req,res) {
     res.render("verification");
})

app.post("/verification", function(req,res) {
     

     if(req.body.submit === "verification") {
      var vari = req.body.mobile;
      let otp = Math.floor((Math.random())*10000);

      var params = {
       'apikey': '62659c5asfu4zvd7898g1kj013e77it8v', // API Key
       'sender': 'SEDEMO', // Sender Name
       'to': [
         vari  //Moblie Number
       ],
       'message': `Hello Dear, Your otp is ${otp}, This is a test message from spring edge`,
        'format':'json'
     };    
     
     console.log(params);
 
     springedge.messages.send(params, 5000, function (err, response) {
   if (err) {
     return console.log(err);
   }
   console.log(response);
 }); 
 
      res.render("otp", {mobile : req.body.mobile , Email : req.body.email , otp : otp});
     } else if(req.body.submit === "otp"){
       var vari = req.body.otp;

       if(vari === req.body.otp){
        res.render("address", { stat : "basic" , Email : req.body.email , mobile : req.body.mobile});
       } else {
          res.render("verification", { Email : req.body.email});   
       }

     }
     
})

app.get("/address", function(req,res) {
  res.render("address", {stat : "basic"});
})

app.post("/address", function(req,res) {
  console.log(req.body);
  var vari = req.body.pincode;
  const url = "https://api.postalpincode.in/pincode/"+vari;

  https.get(url, function(response) {

     console.log(response.statusCode);

     response.on("data", function(data) {
       const places = JSON.parse(data);
       const place = places[0].PostOffice[0];

       console.log(places[0].PostOffice[0]);
       res.render("address", {stat : "advance", location : place , Email : req.body.email , mobile : req.body.mobile});
     });
       
  });

  
})

app.post("/", function(req,res){
   Client.findOneAndUpdate({ Email : req.body.email}, {$push: {Mobile : req.body.mobile}}
    , function(err,success){
      if(err){
        console.log(err);
      } else {
        console.log(success);
      }
    });

    res.redirect("/");

})

app.get("/login", function(req,res){
    res.render("login");
})

app.post("/login", function(req,res) {
    console.log(req.body);

    Client.findOne({Email : req.body.email,Mobile:{$exists:true}}, function(err,client){
        if(err){
          console.log(err);
        } else {
          if(client !== null){
             //client present.. will get logged in
             console.log("present");

             if(client.Password === req.body.password)
             {
                  res.render("logged");
             } else {
                  console.log("Password incorrect!");
                  res.redirect("/login");
             }
          } else {
            //client not present...will send him to sign up page
            console.log("not present");
            
            Client.deleteOne({Email : req.body.email}, function(err){
                if(err){
                  console.log(err);
                } else {
                  console.log("Successfully deleted!");
                  res.redirect("/signup");
                }
            });

          }
        }

      
    });
})


let port = process.env.PORT;
if(port === null || port === ""){
  port = 3000;
}

app.listen(3000, function() {
  console.log("Server has started successfully");
});




