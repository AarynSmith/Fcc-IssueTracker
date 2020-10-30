/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var ObjectId = require('mongodb').ObjectID;

module.exports = function(app, myDatabase) {
  app.route('/api/issues/:project')

    .get(function(req, res) {
      var project = req.params.project;
      var query = {
        ...req.query,
        project
      };
      myDatabase.find(query, {project: 0}).toArray((err, data) => {
        if (err) return res.status(400).json({error: 'error getting data'});
        res.json(data);
      });
    })

    .post(function(req, res) {
      const issue = {
        project: req.params.project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      }

      if (!issue.issue_text ||
        !issue.issue_title ||
        !issue.created_by)
        return res.status(400).json({error: 'missing required fields'});

      myDatabase.insertOne(issue, (err, data) => {
        if (err) return res.status(500).json({error: err})
        issue['_id'] = data.insertedId;
        res.json(issue);
      });
    })

    .put(function(req, res) {
      var project = req.params.project;
      var ID = req.body._id;
      delete req.body._id;
      myDatabase.findOneAndUpdate(
        {project, '_id': ObjectId(ID)},
        {
          $set: {
            ...req.body,
            updated_on: new Date()
          }
        }, {returnOriginal: false}, (err, data) => {
          if (err || !data.value)
            return res.status(400).type('text').send('could not update ' + ID);
          return res.type('text').send('successfully updated');
        })
    })

    .delete(function(req, res) {
      var project = req.params.project;
      var ID = req.body._id;
      if (!ID) return res.status(400).type('text').send('id error')
      myDatabase.findOneAndDelete(
        {project, '_id': ObjectId(ID)},
        (err, data) => {
          if (err || !data.value) return res.status(500).type('text').send('could not delete ' + ID);
          res.status(200).type('text').send('deleted ' + ID)
        })
    });
};