const express=require("express");
const app=express();
const mongoose =require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const { listingSchema }=require("./schema.js");
const Review = require("./models/review.js");


const MONGO_URL="mongodb://127.0.0.1:27017/homeaway";


main().then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log(err);
});




async function main(){
    await mongoose.connect(MONGO_URL);
}
 

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsmate);
app.use(express.static(path.join(__dirname,"/public")));


app.get("/",(req,res)=>{
    res.send("Hello World");
});

const validateListing =(req,res,next)=>{
  let {error}=listingSchema.validate(req.body);
  
  if(error){
    let errMsg=error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400,errMsg);
  }
  else{
    next();
  }

};


// app.get("/testlisting",async (req,res)=>{
//    let sampleListing = new Listing({
//     title: "My New Villa",
//     description:"By the beach",
//     price:1200,
//     location: "Calangute,Goa",
//     country:"india",

//    }) ;
//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("sample was successful saved");
// });



//Index Route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  });

  // new route
  app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
  });



  //show route
  app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  });

  // //create route 
  // app.post("/listings",
  //    async (req, res,next) => {
  //   try{
  //     const newListing = new Listing(req.body.listing);
  //     await newListing.save();
  //     res.redirect("/listings");
  //   }
  //   catch(err){
  //      next(err);
  //   }    
  // });



   //create route 
   app.post("/listings",
    validateListing,
    async (req, res,next) => {
     
  const newListing=new Listing(req.body.listing); 
  await newListing.save();
  res.redirect("/listings");
 });

//  throw new ExpressError(400,"send valid data for listings ");

// } 
// const newListing=new Listing(req.body.listing);
// if (!newListing.description){
//   throw new ExpressError(400," description is missing ");
// }  
// if (!newListing.price){
//   throw new ExpressError(400," price is missing ");
// }  
// if (!newListing.location){
//   throw new ExpressError(400," location  is missing ");
// } 


//optional rout for handling an error 
  //  //create route 
  //  app.post("/listings", 
  //   wrapAsync (async(req, res,next) => {
   
  //     const newListing = new Listing(req.body.listing);
  //     await newListing.save();
  //     res.redirect("/listings");
 
  //   })
    
  // );

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  });
  
  //Update Route
  app.put("/listings/:id",
    validateListing,
     async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  });
  
  //Delete Route
  app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  });

 //Reviews 
 //post Route 
 app.post("/listings/:id/reviews",async(req,res)=>{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.review.push(newReview);
  await newReview.save();
  await listing.save();

  console.log("new review saved");


  res.redirect(`/listings/${listing._id}`);
  // res.send("new review send ");

 });




app.all("*",(req,res,next)=>{
next(new ExpressError(404,"page not found "));
});


app.use((err,req,res,next)=>{
  let { statusCode,message}=err;
  res.render("error.ejs",{message});
  // res.status(statusCode).send(message);
  // res.send("somthing went wrong!");
});

app.listen(8080, ()=>{
    console.log("server is running on port 8080");
});