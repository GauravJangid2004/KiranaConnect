import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());


app.listen(5000, () => {
  console.log('Server is running on port 5000');
});