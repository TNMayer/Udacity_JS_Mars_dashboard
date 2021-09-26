require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

app.get('/mission/:name', async (req, res) => {
    try {
        let missionData = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.name}?api_key=${process.env.API_KEY}`)
            .then(result => {
                return result.json();
            })
        res.send({ missionData });
    } catch (error) {
        console.log('error: ', error)
    }
});

app.get('/photos/:name', async (req, res) => {
    try {
        let photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.name}?api_key=${process.env.API_KEY}`)
            .then(result => {
                return result.json();
            })
            .then(result => {
                return result.photo_manifest.max_date;
            })
            .then(date => fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.name}/photos?earth_date=${date}&api_key=${process.env.API_KEY}`))
            .then(result => {
                return result.json();
            })
        res.send({ photos });
    } catch (error) {
        console.log('error: ', error)
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))