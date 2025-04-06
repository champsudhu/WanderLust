if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
};

const express=require('express');
const app=express();
const mongoose=require("mongoose");
const path = require("path");
const methodOverride = require('method-override');
// const Listing = require("./models/listing.js");
const ejsMate = require("ejs-mate");
// const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
// const {listingSchema,reviewSchema} = require("./schema.js");
// const Review = require("./models/review.js");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');
const { log } = require('console');

app.engine('ejs', ejsMate);
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname,"public")));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

const dbUrl = process.env.ATLASDB_URL;

const store = 
    MongoStore.create({
        mongoUrl: dbUrl,
        crypto: {
            secret: process.env.SECRET
          },
        touchAfter: 24*3600,
    });

store.on("error", ()=>{
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000, //miliseconds(Also Date.now() shows time in miliseconds.)
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main()
.then((res)=>{
    console.log("connection successful.");
})
.catch(err => console.log(err));

async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
    await mongoose.connect(dbUrl);
};

// app.get("/",(req,res)=>{
//     res.send("Root is working!");
// });

// (MOVED TO ROUTES FOLDER => listing.js)
// const validateListing = (req,res,next) => {
//     let {error} = listingSchema.validate(req.body);
//     if (error){
//         const errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else{
//         next();
//     }
// };

// (MOVED TO ROUTES FOLDER => review.js)
// const validateReview = (req,res,next) => {
//     let {error} = reviewSchema.validate(req.body);
//     if (error){
//         const errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else{
//         next();
//     }
// };

app.use((req,res,next)=>{
    res.locals.msg = req.flash("success");
    res.locals.err = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use('/',listingRouter);
app.use('/listings',listingRouter);
app.use('/listings/:id/reviews',reviewRouter);
app.use('/',userRouter);

// (MOVED TO ROUTES FOLDER => listing.js)
// app.get("/",(req,res)=>{
//     res.send("root is working.");
// });


// app.get("/listings", wrapAsync(async (req,res)=>{
//     let listings = await Listing.find();
//     // console.log(listings);
//     res.render("listings/index.ejs",{listings});
// }));

// app.get("/listings/new",(req,res)=>{
//     res.render("listings/new.ejs");
// });

// app.post("/listings", validateListing, wrapAsync(async (req,res,next)=>{
//     // if(!req.body.listing){
//     //     throw new ExpressError(400,"Send a valid data!");
//     // };
//         const newListing = new Listing(req.body.listing);
//         await newListing.save();
//         res.redirect("/listings");
// }));

// app.get("/listings/:id", wrapAsync(async (req,res)=>{
//     let{id}=req.params;
//     const prop1 = await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs",{prop1});
// }));

// app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
//     let{id}=req.params;
//     const detail = await Listing.findById(id);
//     res.render("listings/edit.ejs",{detail});
// }));

// app.put("/listings/:id", validateListing, wrapAsync(async (req,res)=>{
//     let{id} = req.params;
//     await Listing.findByIdAndUpdate(id,{...req.body.listings});
//     res.redirect("/listings");
// }));

// app.delete("/listings/:id", wrapAsync(async (req,res)=>{
//     let{id} = req.params;
//     await Listing.findByIdAndDelete(id);
//     res.redirect("/listings");
// }));

// Reviews
// (MOVED TO ROUTES FOLDER => review.js)
// Post review route
// app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req,res)=>{
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);

//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();

//     console.log("review saved");
//     res.redirect(`/listings/${listing._id}`);
// }));

// // Delete review route
// app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
//     let {id , reviewId} = req.params;
//     await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}}); //$pull: The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/listings/${id}`);
// }));

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
    let{statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
});

app.listen(8080,()=>{
    console.log("app is listening on port 8080");
});