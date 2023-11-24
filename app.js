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
const editFormPage = fs.readFileSync('./views/editform.html', 'utf-8')


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

function replaceHtml(template, jsonfile,index) {
    let out = template.replace('{{%name%}}', jsonfile.name)
    out = out.replace('{{%age%}}', jsonfile.age)
    out = out.replace('{{%phno%}}', jsonfile.phonenumber)
    out = out.replace('{{%bgroup%}}', jsonfile.bloodgroup)
    out = out.replace('{{%editLink%}}', `<a href="/edit/${index}" class="btn btn-primary">Edit</a>`)
    out = out.replace('{{%index%}}', index);
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
        for (let i = 0; i < jsonconvert.length; i++) {
            const user = jsonconvert[i];
            store += replaceHtml(adder, user, i); // Pass the index i to identify the user
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
    }else
    if (urlstore.startsWith('/edit/')) {
        const splitUrl = urlstore.split('/');
        const index = parseInt(splitUrl[2]);

        if(!isNaN(index) && index>=0 && index<jsonconvert.length)
        {
            const edituser = jsonconvert[index]
            const editform = editFormPage
            const filledForm = replaceHtml(editform,edituser,index)
            res.writeHead(200, { 'content-type': 'text/html' })
            res.end(filledForm);
        }
    }else
    if (urlstore === '/update' && req.method === 'POST') {
        let userData = '';
        req.on('data', (chunk) => {
            userData += chunk;
        });
        req.on('end', () => {
            const parsedData = queryString.parse(userData);
            const index = parseInt(parsedData.index);

            if (!isNaN(index) && index >= 0 && index < jsonconvert.length) {
                jsonconvert[index] = {
                    name: parsedData.name,
                    age: parsedData.age,
                    phonenumber: parsedData.phno,
                    bloodgroup: parsedData.bgroup
                };
                writeJson(jsonconvert);
                res.writeHead(302, { 'Location': '/home' });
                res.end();
            } else {
                res.writeHead(404, { 'content-type': 'text/html' });
                res.end('<h1>There is error</h1>');
            }
        });
    }
    else
    {
        res.writeHead(404,{'content-type': 'text/html'})
        res.end("<h1>Page Not Found<h1>")
    }
})

