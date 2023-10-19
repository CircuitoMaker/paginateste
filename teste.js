const express = require('express')
const app = express();
const path = require('path');


app.get('/',function(req,res){
    res.sendFile(path.join(__dirname + '/pagina.html'));
    //__dirname : It will resolve to your project folder.
  });



// Others

app.listen(process.env.PORT ||  3000, ()=>{
    console.log("Server Run!");
})