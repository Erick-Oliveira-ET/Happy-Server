import { getRepository } from 'typeorm';
import { Request, Response } from "express";
import orphanageView from '../views/orphanages_view';
//Yupe doesn't have export default so that's the way to import
import * as Yup from 'yup';

import Orphanage from '../models/Orphanage';

export default {
    async index(req: Request, res: Response) {
        const isVerified = (req.params.isVerified === 'true') ? true : false;
        
        const orphanagesRepository = getRepository(Orphanage);

        // try {
            const orphanages = await orphanagesRepository.find({
                relations: ['images'],
                where: {isVerified: isVerified}
            });
    
            return res.status(200).json(orphanageView.renderMany(orphanages));
            
        // } catch (error) {
        //     return res.status(500).send(error); 
        // }
    },

    async show(req: Request, res: Response) {
        const { id } = req.params;

        const orphanagesRepository = getRepository(Orphanage);

        console.log("Orphanageeees");

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
            open_on_weekends
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
            images,
            isVerified: false,
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
            ),
            isVerified: Yup.boolean().required(),
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
    },

    async edit(req: Request, res: Response) {
        let {
            id,
            name, 
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends
        } =  req.body;

        const orphanagesRepository = getRepository(Orphanage);
        

        //Way to fix the type of the multer format
        const requestImages = req.files as Express.Multer.File[];
        const imagespath = requestImages.map(image => {
            return { path: image.filename }
        })

        const data = {
            id: parseInt(id, 10),
            name, 
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends: open_on_weekends === 'true',
            images: {orphanage_id: id, path: imagespath},
            isVerified: true,
        };


        const schema = Yup.object().shape({
            id: Yup.number().required(),
            name: Yup.string().required(),
            latitude: Yup.number().required(),
            longitude: Yup.number().required(),
            about: Yup.string().required().max(300),
            instructions: Yup.string().required(),
            opening_hours: Yup.string().required(),
            open_on_weekends: Yup.boolean().required(),
            images: Yup.object().shape({  
                orphanage_id: Yup.number().required(),
                path: Yup.array(
                Yup.object().shape({          
                    path: Yup.string().required()
                })
            )}),
            isVerified: Yup.boolean().required(),
        })

        //We set abort early as false to analyse every error to return to the frontend
        await schema.validate(data, {
            abortEarly: false,
        });

        //Makes a database object
        const orphanage = orphanagesRepository.create(data);
        
        try {
            await orphanagesRepository.save( orphanage );
            
            return res.status(201).send();
            
        } catch (error) {

            return res.status(500).send(error);
        }
    },

    async delete(req: Request, res: Response) {
        const { id } = req.params;

        const orphanagesRepository = getRepository(Orphanage);

        try {
            const orphanage = await orphanagesRepository.findOneOrFail(id);

            orphanagesRepository.delete(orphanage);
    
            return res.status(200).json({"OK": "Orphanage deleted successfuly"});
            
        } catch (error) {
            return res.status(404).send(error);

        }
    },


}