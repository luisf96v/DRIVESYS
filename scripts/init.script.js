//Creating Drive Database amd conect to it.
let db = connect('mongodb://127.0.0.1:27017/drive')

print('* Database Drive created');

// Inserting the host enterprise settings
let userData = {
    'name': 'Jose Pablo Cambronero', 
    'email':'jcambromero@gmail.com', 
    'name':'password123', 
    'type':0, 
    'org': null, 
    passr: true
}

db.users.insert(userData, function (err, data) {
    if(!err) {
        printjson(data)
    }else{
        print(err)
    }

})


//db.insert({})/
//db.orgs.insert({'name':'', 'name':'', 'name':'', 'name':''})