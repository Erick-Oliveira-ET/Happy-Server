import { Router } from 'express';
import OrphanagesController  from "./controllers/OrphanagesController";


import multer from 'multer';

import uploadConfig from "./config/upload";
import UsersController from './controllers/UsersController';
const routes = Router();
const upload = multer(uploadConfig);

routes.get('/users/:users_id', UsersController.orphanages)
routes.post('/users', UsersController.create);

routes.get('/orphanages', OrphanagesController.index);
routes.get('/orphanages/:id', OrphanagesController.show);
routes.post('/orphanages', upload.array('images'), OrphanagesController.create);

export default routes;