import { getRepository } from 'typeorm';
import { Request, Response } from "express";
import orphanageView from '../views/orphanages_view';
//Yupe doesn't have export default so that's the way to import
import * as Yup from 'yup';

import Orphanage from '../models/Orphanage';

export default {
    async index(req: Request, res: Response) {
        const orphanagesRepository = getRepository(Orphanage);

        // try {
            const orphanages = await orphanagesRepository.find({
                relations: ['images']
            });
    
            return res.status(200).json(orphanageView.renderMany(orphanages));
            
        // } catch (error) {
        //     return res.status(500).send(error); 
        // }
    },

    async show(req: Request, res: Response) {
        const { id } = req.params;

        const orphanagesRepository = getRepository(Orphanage);

        try {
            const orphanages = await orphanagesRepository.findOneOrFail(id, {
                relations: ['images']
            });
    
            return res.status(200).json(orphanageView.render(orphanages));
            
        } catch (error) {
            return res.status(404).send(error); 
        }
    },

    async create(req: Request, res: Response) {
        const {
            name, 
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends,
        } =  req.body;
        
        const orphanagesRepository = getRepository(Orphanage);

        //Way to fix the type of the multer format
        const requestImages = req.files as Express.Multer.File[];
        const images = requestImages.map(image => {
            return { path: image.filename }
        })

        const data = {
            name, 
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends: open_on_weekends === 'true',
            images
        };

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            latitude: Yup.number().required(),
            longitude: Yup.number().required(),
            about: Yup.string().required().max(300),
            instructions: Yup.string().required(),
            opening_hours: Yup.string().required(),
            open_on_weekends: Yup.boolean().required(),
            images: Yup.array(
                Yup.object().shape({                
                    path: Yup.string().required()
                })
            )
        })

        //We set abort early as false to analyse every error to return to the frontend
        await schema.validate(data, {
            abortEarly: false,
        });

        //Makes a database object
        const orphanage = orphanagesRepository.create(data);

        try {
            await orphanagesRepository.save(orphanage);
            
            return res.status(201).send();
            
        } catch (error) {
    
            return res.status(500).send(error);
        }
    }
}