const User = require('../models/user');

module.exports.signUpUser = (req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.createSignUpUser = async (req,res)=>{
    try{
        let{username,email,password} = req.body;
        const newUser = new User({username,email});
        let regUser = await User.register(newUser,password);
        console.log(regUser);
        req.login(regUser,(err)=>{
            if(err){
                return next(err)
            }
            req.flash("success","Welcome to WanderLust!");
            return res.redirect("/listings");
        });
    } catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    };
};

module.exports.loginUser = (req,res)=>{
    res.render("users/login.ejs")
};

module.exports.loginUserPost = async (req,res)=>{
    req.flash("success","Welcome to WanderLust! You are logged in.");
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","logged out!");
        res.redirect("/listings");
    });
};