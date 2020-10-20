import { getRepository } from 'typeorm';
import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config';

//Yupe doesn't have export default so that's the way to import
import * as Yup from 'yup';

import User from '../models/User';
import Orphanage from '../models/Orphanage';

interface Decoded{
    id: number;
}

export default {

    async orphanages(req: Request, res: Response){
        const { user } = req.params;

        const orphanagesRepository = getRepository(Orphanage);

        try {
            const orphanages = await orphanagesRepository.find({
                where: { user: user }
            });
    
            return res.status(200).json(orphanages);
            
        } catch (error) {
            return res.status(404).send(error); 
        }

    },

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
        
            localStorage.setItem("token", token);

            return res.json({
                id: user.id,
                email: user.email
            });

        } catch (err) {
            return res.status(400).json({ error: "User authentication failed: "  + err.message});
        }
    },

    async authenticateConfirmation(req: Request, res: Response){
        const tokenPassed = req.params.token;

        if (!tokenPassed) {
            return res.status(401).send({ error: "No token provided" });
        }

        const [scheme, token] = tokenPassed.split(" ");
        
        const userRepository = getRepository(User);

        try {
        
            const decoded = jwt.verify(token, config.tokenSecret);
            
            const userId = (<Decoded>decoded).id;
            
            if((await userRepository.findOne(userId))){
                return res.status(200).send(true);

            }

            return res.status(400).send(false);
            

        } catch (err) {
            return res.status(401).send({ error: "Token invalid" });
        }
    }
}