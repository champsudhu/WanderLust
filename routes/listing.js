const express=require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing, isNotOwner} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({ storage });

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createNewListing));
// .post(upload.array("listing[image]",5),(req,res) => {
//     res.send(req.files);
// });

// new route
router.get("/new", isLoggedIn, (listingController.newListing));

router.get("/searchit", listingController.searchListing);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.editTheListing))
.delete(isLoggedIn ,isOwner, wrapAsync(listingController.deleteListing));

// edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

router.get("/:id/book", isLoggedIn, isNotOwner, wrapAsync(listingController.bookProperty));
// index route
// router.get("/", wrapAsync(listingController.index));

// router.post("/", validateListing, wrapAsync(listingController.createNewListing));

// show route
// router.get("/:id", wrapAsync(listingController.show));

// router.put("/:id",isLoggedIn, isOwner, validateListing ,wrapAsync(listingController.editTheListing));

// // delete route
// router.delete("/:id", isLoggedIn ,isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;