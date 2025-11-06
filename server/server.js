const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express()

app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/temp', require('./routes/temp'));
app.use('/api/resumeRoutes', require('./routes/resumeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api', require('./routes/share'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`)
        })
    })
    .catch(err => console.error(err))

