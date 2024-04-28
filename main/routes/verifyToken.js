const jwt = require("jsonwebtoken");
const properties = require("../properties.json")

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token;
    //console.log(authHeader)
    if (authHeader) {
      const token = authHeader;
      if(token === undefined){
        return
      }
      jwt.verify(token, properties.JWT_SEC, (err, user) => {
        if (err) res.status(403).json("Token is not valid!");
        console.log(user,token)
        if(user){
          req.user = user;
          next();
        }
        
        //return;
      });
    }else if(req.session && req.session.token){
		req.user = req.session.user;
		next()
    return;
	} else {
	  if(req.session){
		  res.redirect("/login?next="+req.url)
      return;
	  }
      res.status(401).json("You are not authenticated!");
      return;
    }
  };

  const verifyTokenAndAuthorization = (req,res,next)=>{
    verifyToken(req,res,()=>{
        if(req.user.id || req.user.isAdmin){
            next();      
        }else{
            res.status(403).json("You are not allowed to do that!");
        }
    });
  };

  const verifyTokenAndAdmin = (req,res,next)=>{
    verifyToken(req,res,()=>{
        if(req.user.isAdmin){
            next();      
        }else{
            res.status(403).json("You are not allowed to do that!");
        }
    });
  };

  module.exports = {
    verifyToken, 
    verifyTokenAndAuthorization, 
    verifyTokenAndAdmin,
 };