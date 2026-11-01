import express from 'express';
import path from 'path'
import oidc from 'express-openid-connect';
const { auth, requiresAuth } = oidc;
import dotenv from 'dotenv'
import { initializeDatabase, getStatistics, deletePass, cancelPass, getAllPasses } from './database.js';

dotenv.config()
await initializeDatabase();



const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const baseURL = externalUrl || `http://localhost:${port}`

const app = express();
app.set("views", path.join(import.meta.dirname, "views"));
app.set('view engine', 'pug');

console.log("views path: ", path.join(import.meta.dirname, "views"));

const hostname = externalUrl ? '0.0.0.0': '127.0.0.1'; // must match the callback URL registered in Auth0

const config = { 
  authRequired : false,
  idpLogout : true, //logout not only from the app, but also from identity provider
  secret: process.env.SECRET,
  baseURL: baseURL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH_DOMAIN}`,
  clientSecret: process.env.CLIENT_SECRET,
  routes: {
    logout: false as const // library registers GET /logout only; POST is used instead (see below)
  },
  authorizationParams: {
    response_type: 'code' ,
    //scope: "openid profile email"   
   },
};
// auth router attaches /login and /callback routes to the baseURL (/logout is disabled in routes)
app.use(auth(config));

// logout changes state (removes session), so POST is used instead of GET
// (otherwise any page could log the user out with a link or redirect - logout CSRF)
app.post('/logout', (req, res) => res.oidc.logout());

app.get('/', async function (req, res) {
  let username : string | undefined;
  let passes = [];

  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
    if (username){
      passes = await getAllPasses(username);
    }
  }

  const statistics = await getStatistics();

  res.render('index', {username, total: statistics.total, active: statistics.active, passes});
  console.log("/ radi");
});

app.get('/private', requiresAuth(), function (req, res) {       
    const user = JSON.stringify(req.oidc.user);      
    res.render('private', {user}); 
});

app.get("/sign-up", (req, res) => {
  res.oidc.login({
    returnTo: '/',
    authorizationParams: {      
      screen_hint: "signup",
    },
  });
});


app.post('/:id/cancel', requiresAuth(), async function (req, res){
  const id = req.params.id;
  if (typeof id === 'string'){
    await cancelPass(id);
  }
  res.redirect('/');
});
app.post('/:id/delete', requiresAuth(), async function (req, res){
  const id = req.params.id;
  if (typeof id === 'string'){
    await deletePass(id);
  }
  res.redirect('/');
});



app.listen(port, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${port}`)
  if (externalUrl)
    console.log(`External URL: ${externalUrl}`);
});