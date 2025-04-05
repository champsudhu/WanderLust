const Listing = require('../models/listing');

module.exports.index = async (req,res)=>{
    const listings = await Listing.find({});
    res.render("listings/index.ejs",{listings});
};

module.exports.showListing = async (req,res)=>{
    let{id}=req.params;
    const prop1 = await Listing.findById(id).populate({path: "reviews",populate:{path: "author",},}).populate("owner");
    if(!prop1){
        req.flash("error","Listing doesn't exist!");
        res.redirect("/listings");
    };
    res.render("listings/show.ejs",{prop1});
};

module.exports.newListing = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.createNewListing = async (req,res,next)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send a valid data!");
    // };
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url, filename};
        await newListing.save();
        req.flash("success","Listing added successfully!");
        res.redirect("/listings");
};

module.exports.editListing = async (req,res)=>{
    let{id}=req.params;
    const detail = await Listing.findById(id);
    if(!detail){
        req.flash("error","Listing doesn't exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = detail.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_266");
    res.render("listings/edit.ejs",{detail, originalImageUrl});
};

module.exports.editTheListing = async (req,res)=>{
    let{id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    };
    req.flash("success","Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req,res)=>{
    let{id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted successfully!");
    res.redirect("/listings");
};

module.exports.searchListing = async (req, res) => {
    let{searchDes,category} = req.query;
    if(!searchDes && !category){
        return res.redirect("/listings");
    };
    let searches = await Listing.find({country: { $regex: new RegExp(`^${searchDes}$`, "i")}});
    let searches1 = await Listing.find({category: { $regex: new RegExp(`^${category}$`, "i")}});
    // console.log(searches);
    return res.render("listings/search.ejs",{searches, searches1});
};

module.exports.bookProperty = (req,res) =>{
    let{checkIn, checkOut, guests} = req.query;
    return res.render("listings/book.ejs",{checkIn, checkOut, guests});
};

