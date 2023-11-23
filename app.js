const http = require('http')
const fs = require('fs')
const url = require('url')
const events = require('events')
const path = require('path')
const home = fs.readFileSync('./views/index.html','utf-8')
const signup = fs.readFileSync('./views/form.html','utf-8')
const adder = fs.readFileSync('./views/userdata.html','utf-8')
const jsonconvert = JSON.parse(fs.readFileSync('./json/data.json',`utf-8`))
const queryString=require('querystring')
const jsonFilePath = './json/data.json'

console.log(jsonconvert)

function readJson()
{
    try{
    const jsonData = fs.readFileSync(jsonFilePath,'utf-8')
    return JSON.parse(jsonData)
    }
    catch(error)
    {
        return []
    }
    
}

function writeJson(data)
{
    const jsonString = JSON.stringify(data,null,2)/// converts json to jsobj
    fs.writeFileSync(jsonFilePath,jsonString)
}

function replaceHtml(template, jsonfile) {
    let out = template.replace('{{%name%}}', jsonfile.name)
    out = out.replace('{{%age%}}', jsonfile.age)
    out = out.replace('{{%phno%}}', jsonfile.phonenumber)
    out = out.replace('{{%bgroup%}}', jsonfile.bloodgroup)
    return out;
}


server = http.createServer()
server.listen(8001,'127.0.0.1',()=>
{
    console.log("Server has been started")
})

server.on('request',(req,res)=>
{
    // console.log(req)
    console.log("New request recieved")
    let urlstore = req.url
    if (urlstore === "/" || urlstore === "/home" )
    {
        let store = ''; // Initialize an empty string to store the content
        for (const user of jsonconvert) {
            store += replaceHtml(adder, user);
        }
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(home.replace('{{%%CONTENT%%}}', store));
    }else
    if (urlstore === "/adduser")
    {
        
        res.end(signup)
    }else
    if (urlstore === "/useradded")
    {
        
        res.end(home.replace('{{%%CONTENT}}',"Its Working"))
    }else
    if (urlstore === '/submit' && req.method === 'POST') {   
        console.log('received sign up');
        let userData = '';
        req.on('data', (chunk) => {
            userData += chunk;
        });
        req.on('end', () => {
            let parsedData = queryString.parse(userData);
            const existingData = readJson();
            existingData.push(parsedData);
            writeJson(existingData);
    
            // Update the content with the new user data
            let store = '';
            for (const user of existingData) {
                store += replaceHtml(adder, user);
            }
    
            // Send the updated content as the response
            res.writeHead(200, { 'content-type': 'text/html' });
            res.end(home.replace('{{%%CONTENT%%}}', store));
        });
    }
    else
    {
        res.writeHead(404,{'content-type': 'text/html'})
        res.end("<h1>Bad Request<h1>")
    }
})



