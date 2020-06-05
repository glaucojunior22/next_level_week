import express, { json } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import { celebrate, Joi} from 'celebrate';
import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

//index, show, create, update, delete

const routes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const itemsController = new ItemsController();


routes.get('/items', itemsController.index);

routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);
routes.post(
  '/points',
  upload.single('image'),
  pointsController.create,
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required(),
      items: Joi.string().required()


    })
  }, {
    abortEarly: false
  })
);

export default routes;