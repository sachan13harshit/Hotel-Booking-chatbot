require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');
const chatRoutes = require('./src/routes/chatRoutes');

const app = express();
app.use(express.json());
app.use(cors());

sequelize.sync();

app.use('/api', chatRoutes);

const PORT = process.env.PORT || 3000 ;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});