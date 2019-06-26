const AWS = require('aws-sdk');
const express = require('express');
const uuid = require('uuid');

const IS_OFFLINE = process.env.NODE_ENV !== 'production';
const DYNAMODB_TABLE = process.env.TABLE;

const dynamoDb = IS_OFFLINE === true ?
  new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-2',
    endpoint: 'http://127.0.0.1:8080',
  }) :
  new AWS.DynamoDB.DocumentClient();

const router = express.Router();

router.get('/movies', (req, res) => {
  const params = {
    TableName: DYNAMODB_TABLE
  };
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Error fetching the movies' });
    }
    res.json(result.Items);
  });
});

router.get('/movies/:id', (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: DYNAMODB_TABLE,
    Key: {
      id
    }
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Error retrieving Movie' });
    }
    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ error: `Movie with id: ${id} not found` });
    }
  });
});

router.post('/movies', (req, res) => {
  const name = req.body.name;
  const id = uuid.v4();

  const params = {
    TableName: DYNAMODB_TABLE,
    Item: {
      MovieId,
      Title,
      Format,
      Length,
      ReleaseYear,
      Rating
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      res.status(400).json({ error: 'Could not create Movie' });
    }
    res.json({
      id,
      name
    });
  });
});

router.delete('/movies/:id', (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: DYNAMODB_TABLE,
    Key: {
      id
    }
  };

  dynamoDb.delete(params, (error) => {
    if (error) {
      res.status(400).json({ error: 'Could not delete Movie' });
    }
    res.json({ success: true });
  });
});

router.put('/movies', (req, res) => {
  const id = req.body.id;
  const name = req.body.name;

  const params = {
    TableName: DYNAMODB_TABLE,
    Key: {
      id
    },
    UpdateExpression: 'set #name = :name',
    ExpressionAttributeNames: { '#name': 'name' },
    ExpressionAttributeValues: { ':name': name },
    ReturnValues: "ALL_NEW"
  }

  dynamoDb.update(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Could not update Movie' });
    }
    res.json(result.Attributes);
  })
});

module.exports = router;
