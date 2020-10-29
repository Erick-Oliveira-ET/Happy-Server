import { getRepository } from 'typeorm';
import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config';

const mailer = require('../config/mailer.js');

//Yupe doesn't have export default so that's the way to import
import * as Yup from 'yup';

import User from '../models/User';
import Orphanage from '../models/Orphanage';

interface Decoded{
    id: number;
    email: string;
}

export default {

    async create(req: Request, res: Response){
        let {
            name, 
            email,
            password
        } =  req.body;
        
        const userRepository = getRepository(User);

        password = await bcrypt.hash(password, 8);

        const data = {
            name, 
            email,
            password
        };

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().required().email(),
            password: Yup.string().required()
        })

        //We set abort early as false to analyse every error to return to the frontend
        await schema.validate(data, {
            abortEarly: false,
        });

        //Makes a database object
        const user = userRepository.create(data);

        console.log(user);
        
        try {
            await userRepository.save(user);
            
            return res.status(201).send();
            
        } catch (error) {
    
            return res.status(500).send(error);
        }
    
    },

    async authenticate(req: Request, res: Response){
        const { email, password } = req.body;

        const userRepository = getRepository(User);

        try {
        
            const user = await userRepository.findOne({email});
            
            if (!user) {
              return res.status(400).json({ error: "User not found" });
            }
        
            if (!(await  bcrypt.compare(password, user.password))) {
              return res.status(400).json({ error: "Invalid password" });
            }

            const token = jwt.sign({ id: user.id }, config.tokenSecret, {
                expiresIn: 86400
            });

            return res.json({
                user: {
                    id: user.id,
                    email: user.email
                },
                token
            });

        } catch (err) {
            return res.status(400).json({ error: "User authentication failed: "  + err.message});
        }
    },

    async forgotPassword(req: Request, res: Response){
        const { email } = req.params;

        if (!email) {
            return res.status(401).send({ error: "No email provided" });
        }

        const userRepository = getRepository(User);

        try {
            const user = await userRepository.findOne({email});
            
            if (!user) {
              return res.status(400).json({ error: "User not found" });
            }
        
            const token = jwt.sign({ email, id: user.id }, config.tokenSecret, {
                expiresIn: 3600
            } )
            
            mailer.sendMail({
                to: email,
                from: "erickoliveirasystem@outlook.com",
                subject: "Esqueceu a senha",
                text: `http://localhost:3000/forgot_password/${token}`
            
            }, (err: any) => {
                if (err) {
                    return res.status(400).json({ error: "Send email failed."})
                }

                return res.status(200).send()
            })

            return res.status(200).send();
            

        } catch (err) {
            console.log(err);
            
            return res.status(500).send({ error: "Internal server error" });
        }
    }, 

    async resetPassword(req: Request, res: Response){
        let {
            token,
            newpassword,
            newpasswordverify
        } =  req.body;
        
        const userRepository = getRepository(User);

        const decoded = jwt.verify(token, config.tokenSecret);

        const data = {
            id: (<Decoded>decoded).id,
            email: (<Decoded>decoded).email,
            newpassword,
            newpasswordverify
        };

        const schema = Yup.object().shape({
            id: Yup.number().required(),
            email: Yup.string().required().email(),
            newpassword: Yup.string().required(),
            newpasswordverify: Yup.string().required().required(newpassword),
        })

        const password = await bcrypt.hash(newpassword, 8);


        //We set abort early as false to analyse every error to return to the frontend
        await schema.validate(data, {
            abortEarly: false,
        });

        //Makes a database object
        const user = userRepository.create({ 
            id:(<Decoded>decoded).id, 
            email: (<Decoded>decoded).email, 
            password
        });
        
        try {
            
            await userRepository.save(user);
            
            return res.status(201).send();
            
        } catch (error) {
            console.log(error)
            return res.status(500).send(error);
        }
    }
}