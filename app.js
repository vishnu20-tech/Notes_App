//setup for express
const express=require('express');
const app=express();
const path=require('path');
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate');

//setup passport 
const passport=require('passport');
const LocalStrategy=require('passport-local');

//sessions
const session=require('express-session');
const flash=require('connect-flash');


//model for Notes
const Note=require('./models/notes');

//model for users
const User=require('./models/users');

//check if user is loggedin or not
const { isLoggedIn }=require('./middleware');



//setup for mongoDB
const mongoose=require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/notes-app")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));


//setup for post routes
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//setup for update routes
app.use(methodOverride('_method'));

//layouts
app.engine('ejs',ejsMate);

//setup for views
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));


const sessionConfig={
    secret:'thisissecret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge:1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));


//use the flash
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})


//setup for passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//setup middleware for current User
app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    next();
});


//middleWare for isOwner
const isOwner = async (req, res, next) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        req.flash('error', 'Note not found!');
        return res.redirect('/notes');
    }

    if (!note.user.equals(req.user._id)) {
        req.flash('error', 'You are not allowed to do that!');
        return res.redirect(`/notes/${note._id}`);
    }

    next();
};

//routes -> Notes

//route -> get all notes
app.get('/notes', isLoggedIn, async (req, res) => {
    const notes = await Note.find({
        user: req.user._id
    }).populate('user', 'username');

    res.render('notes/index', { notes });
});

//route -> create new note
app.get('/notes/new',isLoggedIn,(req,res)=>{
    res.render('notes/new');
})
app.post('/notes',isLoggedIn,async(req,res)=>{
    const note=new Note(req.body);
    note.user = req.user._id;
    await note.save();
    req.flash('success','SuccessFully created Note!');
    res.redirect('/notes');
})


// Route: Get one note (view details)
app.get('/notes/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    const note = await Note.findById(id)
        .populate('user', 'username');

    if (!note) {
        req.flash('error', 'Note not found!');
        return res.redirect('/notes');
    }

    res.render('notes/show', { note });
});


// Route: Get edit form
app.get('/notes/:id/edit', isLoggedIn, isOwner, async (req, res) => {
    const { id } = req.params;

    const note = await Note.findById(id);

    if (!note) {
        req.flash('error', 'Note not found!');
        return res.redirect('/notes');
    }

    res.render('notes/edit', { note });
});
app.put('/notes/:id',isLoggedIn,async(req,res)=>{
    const { id }=req.params;
    const note=await Note.findById(id);
    if(!note.user.equals(req.user._id)){
        req.flash('error','You are not allowed to do that');
        res.redirect(`/notes/${note.id}`);
    }else{
         const updateNote=await Note.findByIdAndUpdate(id,req.body,{runValidators:true,new:true});
         res.redirect('/notes');
    }
})


app.delete('/notes/:id',isLoggedIn,isOwner,async(req,res)=>{
    const { id }=req.params;
    const note=await Note.findByIdAndDelete(id);
    res.redirect('/notes');
})


//route -> Users

//route -> user register
app.get('/register',(req,res)=>{
    res.render('users/register');
})

app.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({
            username,
            email
        });

        const registeredUser = await User.register(
            newUser,
            password
        );

        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash('success', 'Registration successful!');
            res.redirect('/notes');
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }
});

//route -> login
app.get('/login',(req,res)=>{
    res.render('users/login');
})

app.post('/login',passport.authenticate('local',{failureRedirect:'/login'}),(req,res)=>{
        req.flash('success','SuccessFully loggedIn');
        res.redirect('/notes');
})


//route -> logout
app.get('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return res.redirect('/login');
        }
        req.flash('success','Successfully Loggedout')
        res.redirect('/notes');
    })
})



//start the server
app.listen(3000,()=>{
    console.log('Server Running at Port : 3000');
})