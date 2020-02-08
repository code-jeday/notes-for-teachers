const isEmail =(string)=>{
    const regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(string.match(regExp)) return true;
    else return false;
};
const isEmpty = (string) =>{
    if(string.trim() === "")return true;
    else return false;
};

exports.validateSignUpData = (data) =>{
    let errors ={};

    if(isEmpty(data.email)){
        errors.email = 'Must not be empty';
    }else if(!isEmail(data.email)){
        errors.email = 'Must be a valid email address';
    }

    if(isEmpty(data.password)) errors.password = 'Must not be empty';
    if(data.confirmPassword !== data.password) errors.confirmPassword = 'Passwords must match';
    if(isEmpty(data.email)) errors.email = 'Must not be empty';//TODO handle заменяем на email

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
};
exports.validateLoginData = (data) =>{
   let errors ={};

   if(isEmpty(data.email)) errors.email = 'Must not be empty';
   if(isEmpty(data.password)) errors.password = 'Must not be empty';

   return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
};


exports.reduceUserDetails =(data) =>{
  let userDetails ={};

  if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
  if(!isEmpty(data.website.trim())){
      //https://website.com else we will add (http://)
      if (data.website.trim().substring(0,4) !=='http'){
          userDetails.website = 'http://'+ data.website.trim();
      }else userDetails.website = data.website;
  }
  if(!isEmpty(data.faculty.trim())) userDetails.faculty = data.faculty;
  if(!isEmpty(data.yearsInCollege.trim())) userDetails.yearsInCollege = data.yearsInCollege;
  if(!isEmpty(data.name.trim())) userDetails.name = data.name;
  if(!isEmpty(data.surname.trim())) userDetails.surname = data.surname;
  if(!isEmpty(data.positions.trim())) userDetails.positions = data.positions;

  return userDetails;
};