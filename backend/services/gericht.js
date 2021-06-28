const helper = require('../helper.js');
const GerichtDao = require('../dao/gerichtDao.js');
const express = require('express');
var serviceRouter = express.Router();

helper.log('- Service Gericht');

serviceRouter.get('/gericht/gib/:id', function(request, response) {
    helper.log('Service Gericht: Client requested one record, id=' + request.params.id);

    const gerichtDao = new GerichtDao(request.app.locals.dbConnection);
    try {
        var result = gerichtDao.loadById(request.params.id);
        helper.log('Service Gericht: Record loaded');
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Gericht: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/gericht/alle/', function(request, response) {
    helper.log('Service Gericht: Client requested all records');

    const gerichtDao = new GerichtDao(request.app.locals.dbConnection);
    try {
        var result = gerichtDao.loadAll();
        helper.log('Service Gericht: Records loaded, count=' + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Gericht: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/gericht/suche/:suchbegriff', function(request, response) {
    helper.log('Service Gericht: Client requested searched records by keyword=' + request.params.suchbegriff);

    const gerichtDao = new GerichtDao(request.app.locals.dbConnection);
    try {
        var result = gerichtDao.search(request.params.suchbegriff);
        helper.log('Service Gericht: Records found, count=' + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Gericht: Error searching for records. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/gericht/existiert/:id', function(request, response) {
    helper.log('Service Gericht: Client requested check, if record exists, id=' + request.params.id);

    const gerichtDao = new GerichtDao(request.app.locals.dbConnection);
    try {
        var result = gerichtDao.exists(request.params.id);
        helper.log('Service Gericht: Check if record exists by id=' + request.params.id + ', result=' + result);
        response.status(200).json(helper.jsonMsgOK({ 'id': request.params.id, 'existiert': result }));
    } catch (ex) {
        helper.logError('Service Gericht: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post('/gericht', function(request, response) {
    helper.log('Service Gericht: Client requested creation of new record');
    

    // daten annehmen
    var bild = request.files.bild;
    var daten = JSON.parse(request.body.eingetippt);

    console.log(daten);

    // dao holen
    const gerichtDao = new GerichtDao(request.app.locals.dbConnection);

    // in db speichern und ergebnis zurückgeben
    try {
        // wirklichen speichern
        gerichtDao.create(daten, bild);
        response.status(200).json(helper.jsonMsgOK("Gericht wurde erfolgreich gespeichert"));
    } catch (ex) {
        // bei fehler sende fehlermeldung zurüc
        response.status(400).json(helper.jsonMsgError("Gericht konnte nicht gespeichert werden"));
    }

});

serviceRouter.put('/gericht', function(request, response) {
    helper.log('Service Gericht: Client requested update of existing record');
    response.status(400).json(helper.jsonMsgError('not implemented'));
});

serviceRouter.delete('/gericht/:id', function(request, response) {
    helper.log('Service Gericht: Client requested deletion of record, id=' + request.params.id);

    const gerichtDao = new GerichtDao(request.app.locals.dbConnection);
    try {
        var obj = gerichtDao.loadById(request.params.id);
        gerichtDao.delete(request.params.id);
        helper.log('Service Gericht: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ 'gelöscht': true, 'eintrag': obj }));
    } catch (ex) {
        helper.logError('Service Gericht: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;