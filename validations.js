import { body } from 'express-validator';

export const loginValidation = [
    body('email', 'Please provide a valid email address.').isEmail(),
    body('password', 'Password must be at least 5 characters long.').isLength({min: 5}),
];

export const registerValidation = [
    body('email', 'Please provide a valid email address.').isEmail(),
    body('password', 'Password must be at least 5 characters long.').isLength({min: 5}),
    body('fullName', 'Please insert Your fullname.').isLength({min: 3}),
    body('avatarUrl', 'Please provide a valid URL.').optional().isURL(),
];

export const postCreateValidation = [
    body('title', 'Please insert the post title').isLength({min: 3}).isString(),
    body('text', 'Please insert the post text').isLength({min: 10}).isString(),
    body('tags', 'Invalid tag format (please provide an array)').optional().isString(),
    body('imageUrl', 'Invalid image link format').optional().isString(),
];
