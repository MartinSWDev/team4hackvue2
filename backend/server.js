const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/places', async (req, res) => {
  const { query, key } = req.query;
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${key}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching places' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
