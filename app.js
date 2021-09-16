const express = require('express');
const lodash = require('lodash')
const portNumber = 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const postCompose = {
    title: [],
    journal: []
};

const home = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet mauris commodo quis. Venenatis a condimentum vitae sapien pellentesque habitant. Id cursus metus aliquam eleifend mi in nulla posuere sollicitudin. Vitae et leo duis ut diam. Vivamus at augue eget arcu dictum varius duis at. Nunc sed velit dignissim sodales ut eu sem. Cursus sit amet dictum sit amet justo donec. Scelerisque purus semper eget duis at tellus. Arcu bibendum at varius vel pharetra vel turpis nunc.";

app.get('/', (req, res) => {
    res.render('home', {
        HOME: home,
        TITLE: postCompose.title,
        JOURNAL: postCompose.journal
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        ABOUT: home
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', {
        CONTACT: home
    });
});

app.get('/compose', (req, res) => {
    res.render('compose', {
        COMPOSE: home
    });
});

app.get('/post/:postTitle', (req, res) => {
    const requestedTittle = lodash.lowerCase(req.params.postTitle);

    for (i = 0; i < postCompose.title.length; i++) {
        if (lodash.lowerCase(postCompose.title[i]) === requestedTittle) {
            console.log(' >Post Match Found');
            res.render('post', {
                TITLE: postCompose.title[i],
                JOURNAL: postCompose.journal[i]
            });
            break;
        }
    }
});


app.post('/compose', (req, res) => {
    if (req.body.title.length === 0 || req.body.journal.length === 0) {
        console.log('Either title or content isnt provided failed to post');
        res.redirect('/');
    }
    else {
        postCompose.title.push(req.body.title);
        postCompose.journal.push(req.body.journal);

        console.log(postCompose);

        res.redirect('/');
    }
});

app.listen(portNumber, () => {
    console.clear();
    console.log(`# Server is live on  port: ${portNumber}`);
});