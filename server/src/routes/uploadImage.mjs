import '../config/passport.mjs';
import express from 'express';
import config from '../config/firebase.mjs';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import multer from 'multer';

const router = express.Router();

//Initialize a firebase application
initializeApp(config.firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

// Setting up multer as a middleware to grab photo uploads
// const upload = multer({ storage: multer.memoryStorage() });
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type, only JPEG, PNG, and GIF are allowed.'), false);
        }
    },
});

router.post('/api/uploadImage', upload.single('filename'), async (req, res) => {
    try {
        console.log('File:', req.file);

        const dateTime = giveCurrentDateTime();

        const storageRef = ref(storage, `files/${req.file.originalname + '       ' + dateTime}`);

        const metadata = {
            contentType: req.file.mimetype,
        };

        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return res.send({
            message: 'file uploaded to firebase storage',
            name: req.file.originalname,
            type: req.file.mimetype,
            downloadURL: downloadURL,
        });
    } catch (error) {
        return res.status(400).send(error.message);
    }
});

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
};

export default router;
