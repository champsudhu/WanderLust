const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");
const ExpressError = require('./utils/ExpressError.js');
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");


module.exports.validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if (error){
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

module.exports.validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if (error){
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){  
        req.session.redirectUrl = req.originalUrl;     
        req.flash("error","User not logged in!");      //req.isAuthenticated() is used to check if the user is logged in or not. 
        return res.redirect("/login");
    };
    next();
};

module.exports.isNotOwner = async (req,res,next) => {
    let { id } = req.params; 
    let listing = await Listing.findById(id); 
    if (!listing) {
        req.flash("error", "Property not found!");
        return res.redirect("/listings");
    }

    if (req.user._id.equals(listing.owner._id)) {
        req.flash("error", "Owners cannot book their own property!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    };
    next();
};

module.exports.isOwner = async (req,res,next) => {
    let{id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner!");
        return res.redirect(`/listings/${id}`);
    };
    next();
};

module.exports.isReviewAuthor = async (req,res,next) => {
    let{id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    };
    next();
};