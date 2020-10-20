import { Router } from 'express';
import OrphanagesController  from "./controllers/OrphanagesController";

import multer from 'multer';

import uploadConfig from "./config/upload";
import UsersController from './controllers/UsersController';

import authentication from "./middlewares/auth";

const routes = Router();
const upload = multer(uploadConfig);

routes.use(authentication);
routes.get('/users', UsersController.orphanages);

routes.post('/users', UsersController.create);
routes.post('/auth', UsersController.authenticate);
routes.post('/auth/:token', UsersController.authenticateConfirmation);

routes.get('/orphanages', OrphanagesController.index);
routes.get('/orphanages/:id', OrphanagesController.show);
routes.post('/orphanages', upload.array('images'), OrphanagesController.create);

export default routes;