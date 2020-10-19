import { getRepository } from 'typeorm';
import { Request, Response } from "express";

//Yupe doesn't have export default so that's the way to import
import * as Yup from 'yup';

import User from '../models/User';
import Orphanage from '../models/Orphanage';

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
        const {
            name, 
            email,
            password
        } =  req.body;
        
        const userRepository = getRepository(User);

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

        try {
            await userRepository.save(user);
            
            return res.status(201).send();
            
        } catch (error) {
    
            return res.status(500).send(error);
        }
    
    }

}