//import
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1293580",
    key: "0138d48ec51e23f2d414",
    secret: "811620e0a43e39477ae8",
    cluster: "us2",
    useTLS: true
  });

//middleware
app.use(express.json());
app.use(cors());

//DB config
const connection_url = 'mongodb+srv://kiento:kiento@cluster0.2ydzi.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

 const db = mongoose.connection

 db.once('open',() => {
     console.log("DB connected");

     const msgCollection = db.collection("messagecontents");
     const changeStream = msgCollection.watch();

     changeStream.on('change', (change) => {
         console.log('A change occur', change);

         if (change.operationType === 'insert') {
             const messageDetails = change.fullDocument;
             pusher.trigger('messages', 'inserted', 
                {
                    name: messageDetails.name,
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    received: false,
                }
            );
         } else {
             console.log('Error triggering Pusher')
         }
     })
 });

//api routes
app.get('/',(req,res)=>res.status(200).send('Phong Ngu'));

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if(err) {
            res.status(500).send(err);
        } else {
            // download and not create
            res.status(200).send(data);
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if(err) {
            res.status(500).send(err);
        } else {
            // create
            res.status(201).send(data);
        }
    })
})

//Listen
app.listen(port, () => console.log(`Listening on localhost:${port}`));