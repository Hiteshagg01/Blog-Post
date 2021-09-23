const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const lodash = require('lodash');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Post = require('./models/Post');

const portNumber = 3000;
const mongoURI = 'mongodb://localhost:27017/bloguserDB';
const app = express();

var loggedInUser = '';
var loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Semper feugiat nibh sed pulvinar proin gravida hendrerit. Sed elementum tempus egestas sed sed risus pretium quam vulputate. Elementum facilisis leo vel fringilla. Magna fringilla urna porttitor rhoncus dolor purus non enim praesent. In massa tempor nec feugiat. Vitae proin sagittis nisl rhoncus mattis rhoncus. Facilisi morbi tempus iaculis urna id volutpat. Fringilla phasellus faucibus scelerisque eleifend donec pretium vulputate sapien nec. Est sit amet facilisis magna etiam tempor orci.';

mongoose.connect(mongoURI, (err) => {
    if (!err) {
        console.log(`> Connected to mongodb on : ${mongoURI}`);
    } else {
        throw err;
    }
});


const store = new MongoDBStore({
    uri: mongoURI,
    collection: 'sessions'
});

store.on('error', err => {
    console.log(err);
});


app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
    secret: 'ThisIsNotAKeyForSigning',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true },
    store: store
}));

const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        res.redirect('/');
    }
}


app.route('/register')
    .get((req, res) => {
        res.render('register');
    })
    .post(async (req, res) => {
        const { username, email, password } = req.body;
        let user = await User.findOne({ username });

        if (user) {
            res.redirect('/login');
        }

        const hashedPsw = await bcrypt.hash(password, 5);

        user = new User({
            username: username,
            email: email,
            password: hashedPsw
        });

        await user.save();
        req.session.isAuth = true;
        loggedInUser = username;
        console.log(`  >${loggedInUser} logged in`);
        res.redirect('/home');
    });

app.route('/login')
    .get((req, res) => {
        res.render('login')
    })
    .post(async (req, res) => {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) { res.redirect('/register'); }

        bcrypt.compare(password, user.password).then((result) => {
            if (result) {
                req.session.isAuth = true;
                loggedInUser = username;
                console.log(`  >${loggedInUser} logged in`);
                res.redirect('/home')
            } else {
                res.redirect('/login');
            }
        });
    });


app.route('/compose')
    .get(isAuth, (req, res) => {
        res.render('compose', {
            COMPOSE: loremIpsum
        });
    })
    .post(isAuth, async (req, res) => {
        const { title, journal } = req.body;
        if (title.length === 0 || journal.length === 0) {
            console.log('Either title or content isnt provided failed to post');
            res.redirect('home');
        } else {

            let post = new Post({
                author: loggedInUser,
                title: title,
                journal: journal
            });

            await post.save();
            res.redirect('home');
        }
    });


app.get('/', (req, res) => {
    if (req.session.isAuth) {
        res.redirect('home');
    }
    res.render('landing');
});

app.get('/home', isAuth, (req, res) => {

    Post.find({ author: loggedInUser }, (err, posts) => {
        if (err) throw err;

        res.render('home', {
            HOME: loremIpsum,
            TITLE: posts,
            JOURNAL: posts,
        });
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        ABOUT: loremIpsum
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', {
        CONTACT: loremIpsum
    });
});



app.get('/post/:postTitle', isAuth, (req, res) => {

    Post.find({ title: req.params.postTitle }, (err, posts) => {
        if (err) throw err;

        for (let i = 0; i < posts.length; i++) {
            if (lodash.lowerCase(posts[i].title) === lodash.lowerCase(req.params.postTitle)) {
                res.render('post', {
                    TITLE: posts[i].title,
                    JOURNAL: posts[i].journal
                });
            } else {
                res.redirect('/');
            }
        }
    });
});


app.listen(portNumber, () => {
    console.clear();
    console.log(`# Server is live on  port: ${portNumber}`);
});