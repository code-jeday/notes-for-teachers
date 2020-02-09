
const { db,admin} =require('../util/admin');

exports.getAllScreams = (req,res) =>{
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
                   createdAt: doc.data().createdAt,
                   awardedAt: doc.data().awardedAt
               });
           });
           return res.json(screams);
       })
       .catch((err) => console.error(err));
};


exports.postOneScream = (req,res) =>{
    if(req.body.body.trim() ===''){
        return res.status(400).json({body:'Body must not be empty'});
    }
    if(req.body.awardedAt.trim() ===''){
        return res.status(400).json({awardedAt:'awardedAt must not be empty'});
    }
   const newScream = {
       body: req.body.body,
       userHandle: req.user.email,
       userImage: req.user.imageUrl,
       createdAt: new Date().toISOString()// мы обращаемся к body а потом уже к данным которые вводим
   };

   db
       .collection('screams')
       .add(newScream)
       .then(doc =>{
           const resScream = newScream;
           resScream.screamId = doc.id;
           res.json(resScream);
       })
       .catch(err=>{
           res.status(500).json({ error: "something went wrong"});
           console.error(err);
       })
};