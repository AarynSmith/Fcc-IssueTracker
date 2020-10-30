/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let TicketID;
  // Create a ticket to update
  console.log('Creating ticket')
  const reqData = {
    issue_title: 'Title',
    issue_text: 'text',
    created_by: 'Functional Test - PUT',
  }
  chai.request(server)
    .post('/api/issues/test')
    .send(reqData)
    .end(function(err, res) {
      if (err) console.log(err);
      TicketID = res.body['_id'];
      console.log("Created TicketID: ", TicketID)
    });

  suite('POST /api/issues/{project} => object with issue data', function() {

    test('Every field filled in', function(done) {
      const reqData = {
        issue_title: 'Title',
        issue_text: 'text',
        created_by: 'Functional Test - Every field filled in',
        assigned_to: 'Chai and Mocha',
        status_text: 'In QA'
      }
      chai.request(server)
        .post('/api/issues/test')
        .send(reqData)
        .end(function(err, res) {
          if (err) console.log(err);
          assert.equal(res.status, 200);
          assert.equal(res.body['project'], "test");
          assert.equal(res.body['issue_title'], reqData['issue_title']);
          assert.equal(res.body['issue_text'], reqData['issue_text']);
          assert.equal(res.body['created_by'], reqData['created_by']);
          assert.equal(res.body['assigned_to'], reqData['assigned_to']);
          assert.equal(res.body['status_text'], reqData['status_text']);
          assert.equal(res.body['open'], true);
          assert.notEqual(res.body['updated_on'], '');
          assert.notEqual(res.body['created_on'], '');
          assert.notEqual(res.body['_id'], '');
          done();
        });
    });

    test('Required fields filled in', function(done) {
      //issue_title, issue_text, created_by
      const reqData = {
        issue_title: 'Title',
        issue_text: 'text',
        created_by: 'Functional Test - Only Required fields filled in',
      }
      chai.request(server)
        .post('/api/issues/test')
        .send(reqData)
        .end(function(err, res) {
          if (err) console.log(err);
          assert.equal(res.status, 200);
          assert.equal(res.body['project'], "test");
          assert.equal(res.body['issue_title'], reqData['issue_title']);
          assert.equal(res.body['issue_text'], reqData['issue_text']);
          assert.equal(res.body['created_by'], reqData['created_by']);
          assert.equal(res.body['assigned_to'], '');
          assert.equal(res.body['status_text'], '');
          assert.equal(res.body['open'], true);
          assert.notEqual(res.body['updated_on'], '');
          assert.notEqual(res.body['created_on'], '');
          assert.notEqual(res.body['_id'], '');
          done();
        });
    });

    test('Missing required fields', function(done) {
      const reqData = {
        issue_text: 'text',
        created_by: 'Functional Test - Missing Title',
      }
      chai.request(server)
        .post('/api/issues/test')
        .send(reqData)
        .end(function(_, res) {
          assert.equal(res.status, 400);
          assert.equal(res.body.error, "missing required fields");
          done();
        });
    });

  });

  suite('PUT /api/issues/{project} => text', function() {



    test('No body', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({_id: TicketID})
        .end(function(err, res) {
          if (err) console.log(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
    });

    test('One field to update', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: TicketID,
          issue_text: "updated Text"
        })
        .end(function(err, res) {
          if (err) console.log(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
    });

    test('Multiple fields to update', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: TicketID,
          status_text: "done",
          open: false,
        })
        .end(function(err, res) {
          if (err) console.log(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
    });

    test('Invalid ticket ID', function(done) {
      invTicket = '000000000000000000000000'
      chai.request(server)
        .put('/api/issues/test')
        .send({_id: invTicket})
        .end(function(_, res) {
          assert.equal(res.status, 400);
          assert.equal(res.text, 'could not update ' + invTicket);
          done();
        });
    });
  });

  suite('GET /api/issues/{project} => Array of objects with issue data', function() {

    test('No filter', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res) {
          if (err) console.log("Test -> err:", err)
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
    });

    test('One filter', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({open: true})
        .end(function(err, res) {
          if (err) console.log("Test -> err:", err)
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(elem => {
            assert.property(elem, 'issue_title');
            assert.property(elem, 'issue_text');
            assert.property(elem, 'created_on');
            assert.property(elem, 'updated_on');
            assert.property(elem, 'created_by');
            assert.property(elem, 'assigned_to');
            assert.property(elem, 'open');
            assert.property(elem, 'status_text');
            assert.property(elem, '_id');
            assert.isTrue(elem.open, "Closed ticket returned");
          });
          done();
        });
    });

    test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({
          open: true,
          status_text: "done"
        })
        .end(function(err, res) {
          if (err) console.log("Test -> err:", err)
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(elem => {
            assert.property(elem, 'issue_title');
            assert.property(elem, 'issue_text');
            assert.property(elem, 'created_on');
            assert.property(elem, 'updated_on');
            assert.property(elem, 'created_by');
            assert.property(elem, 'assigned_to');
            assert.property(elem, 'open');
            assert.property(elem, 'status_text');
            assert.property(elem, '_id');
            assert.isTrue(elem.open, "Closed ticket returned");
          });
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project} => text', function() {

    test('No _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function(_, res) {
          assert.equal(res.status, 400);
          assert.equal(res.text, 'id error');
          done();
        });;
    });

    test('Valid _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({_id: TicketID})
        .end(function(_, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'deleted ' + TicketID);
          done();
        });
    });

  });

});
