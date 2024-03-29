const express = require('express');
const debug = require('debug')('app');
const morgan = require('morgan');
const chalk = require('chalk');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUI = require('swagger-ui-express');
const helmet = require('helmet');
const cors = require('cors');
const yaml = require('yamljs');

dotenv.config();
const port = process.env.PORT;

if(process.env.NODE_ENV == 'development') {
  const db = mongoose.connect(process.env.DB_LINK);
  debug(`This ${chalk.green('is')} a test.`);
} else if(process.env.NODE_ENV == 'production') {
  const db = mongoose.connect('');
  debug(`This ${chalk.red('is not')} a test.`);
}

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(morgan('tiny'));
app.use(helmet());
app.use(cors());

const productModel = require(path.join(__dirname, '/models/productModel'));
const userModel = require(path.join(__dirname, '/models/userModel'));
const userRoleModel = require(path.join(__dirname, '/models/userRoleModel'));

const productRouter = require(path.join(__dirname, '/routes/productRouter'))(productModel);
const userRouter = require(path.join(__dirname, '/routes/userRouter'))(userModel, userRoleModel);
const userRoleRouter = require(path.join(__dirname, '/routes/userRoleRouter'))(userRoleModel);

app.use('/api', productRouter);
app.use('/api', userRouter);
app.use('/api', userRoleRouter);

const swaggerDocument = yaml.load(path.join(__dirname, '/swagger/swagger.yaml'));
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.listen(port, () => {
  debug(`Listening on port ${chalk.green(port)}.`);
});
