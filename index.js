import express from "express";
import {v7 as uuidv7} from "uuid";
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies 

app.get("/", (req, res) => {
  res.send("Hello World!");
}); 

app.post('/api/profiles', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name is required"
      });
    }

    const [genderResult, ageResult, countryResult] = await Promise.all([
      fetch(`https://api.genderize.io?name=${name}`),
      fetch(`https://api.agify.io?name=${name}`),
      fetch(`https://api.nationalize.io?name=${name}`)
    ]);

    const genderData = await genderResult.json();
    const ageData = await ageResult.json();
    const countryData = await countryResult.json();

    // Extract values properly
    const gender = genderData.gender;
    const gender_probability = genderData.probability;
    const sample_size = genderData.count;



    const age = ageData.age;

    // Age group
    let age_group;
    if (age <= 12) age_group = "child";
    else if (age <= 19) age_group = "teenager";
    else if (age <= 59) age_group = "adult";
    else age_group = "senior";

    // Top country
    const topCountry = countryData.country.reduce((prev, curr) =>
      curr.probability > prev.probability ? curr : prev
    );

    const country_id = topCountry.country_id;
    const country_probability = topCountry.probability;

    // Create response object
    const profile = {
      id: uuidv7(),
      name,
      gender,
      gender_probability,
      sample_size,
      age,
      age_group,
      country_id,
      country_probability,
      created_at: new Date().toISOString()
    };

    return res.status(201).json({
      status: "success",
      data: profile
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
});



app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});