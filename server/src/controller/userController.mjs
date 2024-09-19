import { matchedData, validationResult } from 'express-validator';
import { User } from '../mongoose/schemas/user.mjs';
import Notification from '../mongoose/schemas/notification.mjs';
import { hashPassword } from '../utils/helpers.mjs';

class UserController {
    static async getUsers(request, response) {
        const { filter, value } = request.query;
        try {
            let users;
            if (filter && value) {
                const filterQuery = {};
                filterQuery[filter] = { $regex: new RegExp(value, 'i') };
                users = await User.find(filterQuery);
            } else {
                users = await User.find();
            }
            return response.status(200).send(users);
        } catch (err) {
            console.log(err);
            return response.sendStatus(500);
        }
    }

    static async getUserById(request, response) {
        const id = request.params.id;

        try {
            const findUser = await User.findById(id);
            return response.status(201).send(findUser);
        } catch (err) {
            console.log(err);
            return response.sendStatus(404);
        }
    }

    static async getUserBasicInfo(request, response) {
        const id = request.params.id;
        try {
            const findUser = await User.findById(id, 'name email avatar bio');
            if (!findUser) {
                return response.status(404).send({ message: 'User not found' });
            }
            return response.status(200).send(findUser);
        } catch (err) {
            console.error(err);
            return response.status(500).send({ message: 'Internal server error' });
        }
    }
    static async getRandomUsers(request, response) {
        const userId = request.params.id;
        try {
            const currentUser = await User.findById(userId);
            if (!currentUser) {
                return response.status(404).send({ message: 'User not found' });
            }

            const followingIds = currentUser.following.map((user) => user.toString());

            const usersNotFollowing = await User.find(
                { _id: { $nin: [...followingIds, userId] } },
                { name: 1, _id: 1, avatar: 1, bio: 1, email: 1 },
            );
            const numberOfUsers = Math.min(5, usersNotFollowing.length);

            const randomIndexes = [];
            while (randomIndexes.length < numberOfUsers) {
                const randomIndex = Math.floor(Math.random() * usersNotFollowing.length);
                if (!randomIndexes.includes(randomIndex)) {
                    randomIndexes.push(randomIndex);
                }
            }

            const randomUsers = randomIndexes.map((index) => usersNotFollowing[index]);

            return response.status(200).send(randomUsers);
        } catch (err) {
            console.error(err);
            return response.status(500).send({ message: 'Internal server error' });
        }
    }

    static async createUser(request, response) {
        const result = validationResult(request);
        if (!result.isEmpty()) return response.status(400).send(result.array());

        const data = matchedData(request);
        console.log(data);
        data.password = hashPassword(data.password);
        console.log(data);

        const newUser = new User(data);
        try {
            const savedUser = await newUser.save();
            return response.status(201).send(savedUser);
        } catch (err) {
            console.log(err);
            return response.sendStatus(400);
        }
    }

    static async updateUser(request, response) {
        const id = request.params.id;
        const body = request.body;
        try {
            const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
            return response.status(200).send(updatedUser);
        } catch (err) {
            console.log(err);
            return response.sendStatus(500);
        }
    }

    static async deleteUser(request, response) {
        const id = request.params.id;
        try {
            await User.findByIdAndDelete(id);
            return response.sendStatus(200);
        } catch (err) {
            console.log(err);
            return response.sendStatus(500);
        }
    }

    static async getNotifications(request, response) {
        try {
            const { id: userId } = request.params;
            const notifications = await Notification.find({ user: userId }).sort({ created_at: -1 });

            response.status(200).json({ notifications });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            response.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default UserController;
