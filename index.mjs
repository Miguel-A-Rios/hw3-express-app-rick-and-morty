import express from 'express';

import { getCharacter, getEpisode, getLocation } from 'rickmortyapi';


const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));


// routes
app.get('/', (req, res) => {
   res.render('home.ejs')
});

app.get("/about", (req, res) => {
   res.render("about", { title: "About" });
});

app.get("/search", (req, res) => {
   res.render("search", { title: "Search", character: undefined, error: null });
});

app.get("/searchLocation", (req, res) => {
   res.render("searchLocation.ejs", { title: "Search Location", location: null, residents: [], error: null });
});

app.get('/characters', async (req, res) => {
   //  let url = "https://rickandmortyapi.com/api/character";

   // let origin = req.query.origin;
   // let location = req.query.location;
   // let episode = req.query.location;
   // let type = req.query.type;

   //  res.render("characters.ejs", {name, species, gender, status})

   try {
      let url = "https://rickandmortyapi.com/api/character";


      const response = await fetch(url);
      if (!response.ok) {
         throw new Error("Error accessing API endpoint")
      }
      const data = await response.json();
      console.log(data);

      let name = req.query.name;
      let species = req.query.species;
      let gender = req.query.gender;
      let status = req.query.status;

      res.render("characters.ejs", { characters: data.results, name, species, gender, status })

   } catch (err) {
      if (err instanceof TypeError) {
         alert("Error accessing API endpoint (network failure)");
      } else {
         alert(err.message);
      }
   } //catch
});

app.post("/search", async (req, res) => {
   let name = req.body.name;
   let url = `https://rickandmortyapi.com/api/character/?name=${name}`;
   let response = await fetch(url);
   let data = await response.json();

   res.render("search.ejs", {character: data.results ? data.results[0] : null});
});

app.post("/searchLocation", async (req, res) => {
   let name = req.body.name;
   let url = `https://rickandmortyapi.com/api/location/?name=${name}`;
   // Fetch location data by name
   let response = await fetch(url);
   let data = await response.json();

   if (!data.results || data.results.length == 0) {
       return res.render("searchlocation.ejs", {title: "Search Location", location: null, residents: [],
           error: "No location found with that name.",});
   }
   // Use the first matching location
   let location = data.results[0];

   // Fetch all resident characters
   let residents = [];
   for (let url of location.residents) {
       let resChar = await fetch(url);
       let charData = await resChar.json();
       residents.push(charData);
   }

   res.render("searchLocation.ejs", {title: `Location: ${location.name}`, location, residents, error: null});
});

app.listen(3000, () => {
   console.log('server started');
});
