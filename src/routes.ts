import { Router } from 'express';
import OrphanagesController  from "./controllers/OrphanagesController";

import multer from 'multer';

import uploadConfig from "./config/upload";
import UsersController from './controllers/UsersController';

import authentication from "./middlewares/auth";

const routes = Router();
const upload = multer(uploadConfig);

// routes.use(authentication);

routes.post('/users', UsersController.create);
routes.post('/auth', UsersController.authenticate);
routes.post('/auth/:token', UsersController.authenticateConfirmation);

routes.get('/orphanages/:isVerified', OrphanagesController.index);
routes.get('/orphanage/:id', OrphanagesController.show);
routes.post('/orphanages', upload.array('images'), OrphanagesController.create);
routes.put('/orphanages', upload.array('images'), OrphanagesController.edit);
routes.delete('/orphanages/:id', OrphanagesController.delete);

export default routes;