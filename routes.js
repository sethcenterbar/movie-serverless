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
      console.log(error)
      res.status(400).json({ error: 'Error fetching the movies' });
    }
    res.json(result.Items);
  });
});

router.get('/movies/:MovieId', (req, res) => {
  const MovieId = req.params.MovieId;

  const params = {
    TableName: DYNAMODB_TABLE,
    Key: {
      MovieId
    }
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Error retrieving Movie' });
    }
    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ error: `Movie with MovieId: ${MovieId} not found` });
    }
  });
});

router.post('/movies', (req, res) => {
  const MovieId = uuid.v4();
  const Title = req.body.Title;
  const Format = req.body.Format;
  const Length = req.body.Length;
  const ReleaseYear = req.body.ReleaseYear;
  const Rating = req.body.Rating;

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
      MovieId,
      Title,
      Format,
      Length,
      ReleaseYear,
      Rating
    });
  });
});

router.delete('/movies/:MovieId', (req, res) => {
  const MovieId = req.params.MovieId;

  const params = {
    TableName: DYNAMODB_TABLE,
    Key: {
      MovieId
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
  const MovieId = req.body.MovieId;
  const Title = req.body.Title;
  const Format = req.body.Format;
  const Length = req.body.Length;
  const ReleaseYear = req.body.ReleaseYear;
  const Rating = req.body.Rating;


  const params = {
    TableName: DYNAMODB_TABLE,
    Key: {
      MovieId
    },
    UpdateExpression: 'set #Title = :Title, #Format = :Format, #Length = :Length, #ReleaseYear = :ReleaseYear, #Rating = :Rating',
    ExpressionAttributeNames: { '#Title': 'Title', '#Format': 'Format', '#Length': 'Length', '#ReleaseYear': 'ReleaseYear', '#Rating': 'Rating' },
    ExpressionAttributeValues: { ':Title': Title, ':Format': Format, ':Length': Length, ':ReleaseYear': ReleaseYear, ':Rating': Rating },
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
