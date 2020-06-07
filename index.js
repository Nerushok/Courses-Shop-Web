const path = require('path');
const csurf = require('csurf');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const homeRoutes = require('./routes/home');
const authRouted = require('./routes/auth');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cardRoutes = require('./routes/card');
const ordersRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile')
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const errorHandlerMiddleware = require('./middleware/error');
const fileMiddleware = require('./middleware/file')
const keys = require('./keys/index');

const app = express();

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers')
});
const mongoStore = new MongoStore({
    collection: 'sessions',
    uri: keys.DB_URI
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore
}));
app.use(fileMiddleware.single('avatar'))
app.use(csurf())
app.use(flash())
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/auth', authRouted);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/profile', profileRoutes)
app.use(errorHandlerMiddleware)


const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoose.connect(keys.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`)
        });
    } catch (e) {
        console.log(e)
    }
}

start();
