var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, { useNewUrlParser: true }, function(err, doc) {
    if(err) {
        console.log('Error de conexion')
    } else {
        var drive = doc.db("drive");
        let userData = {
            'name': 'Jose Pablo Cambronero', 
            'email':'jcambromero@gmail.com', 
            'name':'password123', 
            'type':0, 
            'org': null, 
            passr: true
        }
        drive.collection('users').insertOne(userData, (err, data)=>{
            if(err) {
                console.error(err)
            } else {
                console.log(data)
            }
        })
    }
});