const express = require('express');
const { models } = require('mongoose');
const debug = require('debug')('app:productRouter');
const { verifyToken, authorizeClient, authorizeModerator } = require('../middleware/authenticate');

function routes(productModel) {
  const productRouter = express.Router();

  productRouter.route('/product')
    .post([verifyToken, authorizeModerator], (req, res) => {
      const product = new productModel(req.body);
      
      /* POST requirements here */

      if(!(product.name && product.price)) {
        res.status(400);
        return res.send('Invalid entry.');
      }
  
      product.save();
      res.status(201);
      return res.json(product);
    })
    .get([verifyToken, authorizeClient], (req, res) => {
      const query = {};

      Object.assign(query, req.query);
  
      productModel.find(query, (err, products) => {
        if(err) {
          res.send(err);
        }
  
        const returnProduct = products.map((product) => {
          let newProduct = product.toJSON();
          /* Extra processing */
          return newProduct;
        });
        return res.json(returnProduct);
      });
    });

  productRouter.use('/product/:productId', verifyToken, (req, res, next) => {
    productModel.findById(req.params.productId, (err, product) => {
      if(err) {
        return res.sendStatus(404);
      }
      if(product) {
        req.product = product;
        return next();
      }
      return res.sendStatus(400);
    });
  });

  productRouter.route('/product/:productId')
    .get(authorizeClient, (req, res) => {
      const returnProduct = req.product.toJSON();
      res.json(returnProduct);
    })
    .put(authorizeModerator, (req, res) => {
      const { product } = req;

      Object.assign(product, req.body);

      req.product.save((err) => {
        if(err) {
          return res.send(err);
        }
        res.status(200);
        return res.json(product);
      })
    })
    .delete(authorizeModerator, (req, res) => {
      req.product.remove((err) => {
        if(err) {
          return res.send(err);
        }
        return res.sendStatus(200);
      })
    });

  return productRouter;
}

module.exports = routes;