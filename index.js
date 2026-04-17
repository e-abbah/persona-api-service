import express from "express";
import { get } from "node:http";
import {v7 as uuidv7} from "uuid";
const app = express();
const profilesById = new Map(); // In-memory storage for profiles
const profilesByName = new Map(); // In-memory storage for profiles by name

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

const PORT = process.env.PORT || 3000;

const getAgeGroup = (age) => {
  if (age <= 12) return "child";
  if (age <= 19) return "teenager";
  if (age <= 59) return "adult";
  return "senior";
};

const getTopCountry = (countries) => {
  return countries.reduce((prev, curr) =>
    curr.probability > prev.probability ? curr : prev
  );
};

app.use(express.json()); // Middleware to parse JSON bodies 

app.get("/", (req, res) => {
  res.send("Hello World!");
}); 

app.post('/api/profiles', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Name is required or invalid name"
      });
    }

    
    //Idempotency check
    const normalizedName = name.toLowerCase();

    if (profilesByName.has(normalizedName)) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: profilesByName.get(normalizedName)
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

    if (!genderData.gender || genderData.count ==0 ){
      return res.status(502).json({
        status: "502",
        message: "Genderize returned an invalid response"

      });
    }

    if (!ageData.age){
      return res.status(502).json({
        status: "502",
        message: "Agify returned an invalid response"
    });
  }

  if (!countryData.country || countryData.country.length === 0) {
    return res.status(502).json({
      status: "502",
      message: "Nationalize returned an invalid response"
    });
  }

     


   
  const age = ageData.age;
    
   const profile = {
      id: uuidv7(),
      name: normalizedName,
      gender: genderData.gender,
      gender_probability: genderData.probability,
      sample_size: genderData.count,
      age,
      age_group: getAgeGroup(age),
      country_id: getTopCountry(countryData.country).country_id,
      country_probability: getTopCountry(countryData.country).probability,
      created_at: new Date().toISOString()
    };

   
    profilesById.set(profile.id, profile);
    profilesByName.set(normalizedName, profile);

    return res.status(201).json({
      status: "success",
      data: profile
    });

  } catch (error) {
    console.log("ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
});


app.get('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  const profile = profilesById.get(id);
  if (!profile) {
    return res.status(404).json({
      status: "error",
      message: "Profile not found"
    });
  }
  else {
    return res.status(200).json({
      status: "success",
      data: profile
    });
  }
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});

//019d9cbf-b72e-71ac-83ef-c8022790d600