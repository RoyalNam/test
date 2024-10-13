import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import router from './src/routes/index.mjs';
import dotenv from 'dotenv';
import { app, server } from './src/socket/socket.mjs';

dotenv.config();

mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log('connect to database'))
    .catch((err) => console.log(`Error: ${err}`));

app.use(
    cors({
        origin: true,
        methods: 'GET,POST,PUT,DELETE',
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: '*',
        credentials: true,
    }),
);
// app.options('*', cors());

app.use(express.json());
app.use(cookieParser('helloworld'));
app.use(
    session({
        secret: 'hieu is the dev',
        saveUninitialized: true,
        resave: false,
        cookie: {
            maxAge: 60000 * 60,
        },
        store: MongoStore.create({
            client: mongoose.connection.getClient(),
        }),
    }),
);

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use(passport.initialize());
app.use(passport.session());
app.get('/', (request, response) => {
    console.log(request.session);
    request.session.visited = true;

    response.status(201).send({ msg: 'Hello World' });
});

app.use(router);

const port = process.env.PORT || 5000;

const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const host = 'localhost';

server.listen(port, () => {
    console.log(`Server running on ${protocol}://${host}:${port}`);
});
