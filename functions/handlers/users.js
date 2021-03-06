const {db,admin} = require('../util/admin');

const config = require('../util/config');

const  firebase = require('firebase');
firebase.initializeApp(config);

const {validateSignUpData, validateLoginData, reduceUserDetails } = require('../util/validators');
// user sign up
exports.signup = (req,res) =>{
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        //handle: req.body.handle,//TODO удаляем
    };
    // validation check
    const {valid,errors} = validateSignUpData(newUser);

    if(!valid) return res.status(400).json(errors);

    const noImage ='no-image.jpg';

    let token, userId;
    db.doc('/users/'+newUser.email)//TODO заменяем на email
        .get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({email: 'this email is already taken'});//TODO заменяем на email
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data =>{
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) =>{
            token = idToken;
            const userCredential ={
                //handle: newUser.handle,//TODO заменяем на email / удаляем
                email: newUser.email,
                createdAt: new Date().toISOString(),
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/' + config.storageBucket + '/o/' + noImage + '?alt=media',
                userId: userId
            };
            return db.doc('/users/'+newUser.email).set(userCredential);//TODO заменяем на email
        })
        .then(()=>{
            return res.status(201).json({token});
        })
        .catch(err =>{
            console.error(err);
            if(err.code == "auth/email-already-in-use"){
                return res.status(400).json({email: 'Email is already in use'});
            }else{
                return res.status(500).json({general: 'Something went wrong'});
            }
        })
};
//user login
exports.login = (req,res) =>{
   const user={
       email :req.body.email,
       password: req.body.password
   };

   const {valid,errors} = validateLoginData(user);

   if(!valid) return res.status(400).json(errors);

   firebase
       .auth()
       .signInWithEmailAndPassword(user.email, user.password)
       .then(data =>{
           return data.user.getIdToken();
       })
       .then((token) =>{
           return res.json({token});
       })
       .catch((err)=>{
           console.error(err);
           return res
               .status(403)
               .json({general:'Wrong credentials, please try again'});
       });
};

// Add user details
exports.addUserDetails = (req, res) =>{
    let userDetails = reduceUserDetails(req.body);

    db.doc('/users/'+req.user.email)//TODO заменяем на email
        .update(userDetails)
        .then(() =>{
          return res.json({message: 'Details added successfully'});
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({error: err.code});
        })
};
// Get personal user details
exports.getAuthenticatedUser =(req,res) =>{
  let userData ={};
  db.doc(`/users/${req.user.email}`).get()
      .then(doc=>{
          if(doc.exists){
              userData = doc.data();
              return res.json(userData);
          }
      })
      .catch(err =>{
          console.error(err);
          return res.status(500).json({error:err.code});
      })
};
//Get user details
exports.getAllAuthenticatedUser = (req,res)=>{
  db
      .collection('users')
      .orderBy('email')//TODO заменяем на email
      .get()
      .then((data) =>{
         let users =[];
         data.forEach((doc) =>{
            users.push({
                userId: doc.id,
                imageUrl:doc.data().imageUrl,
                //handle: doc.data().handle,//TODO удаляем
                bio:doc.data().bio,
                faculty:doc.data().faculty,
                yearsInCollege:doc.data().yearsInCollege,
                website:doc.data().website,
                createdAt:doc.data().createdAt,
                position:doc.data().positions,
                name:doc.data().name,
                surname:doc.data().surname,
            });
         });
         return res.json(users);
      })
      .catch((err) => console.error(err));
};

//Upload image for profile
exports.uploadImage = (req,res) =>{
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: req.headers });

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname, file, filename, encoding, mimetype);
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({ error: 'Wrong file type submitted' });
    }
    // my.image.png => ['my', 'image', 'png']
    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    // 32756238461724837.png
    imageFileName = `${Math.round(
      Math.random() * 1000000000000
    ).toString()}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
          config.storageBucket
        }/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.email}`).update({ imageUrl });//TODO заменяем на email
      })
      .then(() => {
        return res.json({ message: 'image uploaded successfully' });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: 'something went wrong' });
      });
  });
  busboy.end(req.rawBody);
};











