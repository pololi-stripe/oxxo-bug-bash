const express = require('express');
// const _bodyParser = require('body-parser')
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
app.use(express.static(path.join(__dirname, 'build')));

app.get('/express_backend', function (req, res) {
    return res.send({message: 'Your express backend is connected to react.'});
});

app.listen(port, () => console.log(`Listening on port ${port}`)); 
