const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const Config = {
    apiKey: "AIzaSyDT4HXHLMbly0ZIa6DVsgKu0K8wDv4vLsM",
    authDomain: "notes-for-teachers.firebaseapp.com",
    databaseURL: "https://notes-for-teachers.firebaseio.com",
    projectId: "notes-for-teachers",
    storageBucket: "notes-for-teachers.appspot.com",
    messagingSenderId: "988993098854",
    appId: "1:988993098854:web:a1f8e9af8a4319f9d309a7",
    measurementId: "G-W7CY866JXL"
};

const firebase = require('firebase');
firebase.initializeApp(Config);

const db =admin.firestore();

app.get('/screams', (req,res) =>{
   db
       .collection('screams')
       .orderBy('createdAt','desc')
       .get()
       .then((data) =>{
           let screams =[];
           data.forEach((doc) =>{
               screams.push({
                   screamId: doc.id,
                   body: doc.data().body,
                   userHandle: doc.data().userHandle,
                   createdAt: doc.data().createdAt
               });
           });
           return res.json(screams);
       })
       .catch((err) => console.error(err));
});


app.post('/scream',(req,res) =>{
   const newScream = {
       body: req.body.body,
       userHandle: req.body.userHandle,
       createdAt: admin.firestore.Timestamp.fromDate(new Date())
   };

   db
       .collection('screams')
       .add(newScream)
       .then(doc =>{
           res.json({ message: 'document ' + doc.id +' created successfully'});
       })
       .catch(err=>{
           res.status(500).json({ error: "something went wrong"});
           console.error(err);
       })
});
// Signup route
app.post('/signup',(req,res) =>{
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        passwordCongig: req.body.passwordCongig,
        handel: req.body.handel,
    };

    db.doc('/users/'+newUser.handel).get()
        .then(doc =>{
           if(doc.exists){
               return res.status(400).json({handle:'this hendle is already taken'});
           }else{
               firebase
           }
        });

    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data =>{
            return res.status(201).json({message: 'user '+ data.user.uid+' signed up successfully'});
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({ error: err.code});
        })
});



// https://basurl.com/api
exports.api = functions.region('europe-west1').https.onRequest(app);

