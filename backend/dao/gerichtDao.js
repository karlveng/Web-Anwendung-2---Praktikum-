const helper = require('../helper.js');
const fileHelper = require('../fileHelper.js');
const SpeisenartDao = require('./speisenartDao.js');
const ZutatenlisteDao = require('./zutatenlisteDao.js');
const ZubereitungsschritteDao = require('./zubereitungsschritteDao.js');

class GerichtDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        var sql = 'SELECT * FROM Gericht where id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result))
            throw new Error('No Record found by id=' + id);

        result = helper.objectKeysToLower(result);

        const zubereitungsschritteDao = new ZubereitungsschritteDao(this._conn);
        result.zubereitungsschritte = zubereitungsschritteDao.loadAllByParent(id);

        const speisenartDao = new SpeisenartDao(this._conn);
        result.speisenarten = speisenartDao.loadAllByGericht(id);

        const zutatenlisteDao = new ZutatenlisteDao(this._conn);
        result.zutatenliste = zutatenlisteDao.loadAllByParent(id);

        return result;
    }

    loadAll() {
        const zubereitungsschritteDao = new ZubereitungsschritteDao(this._conn);
        const speisenartDao = new SpeisenartDao(this._conn);
        const zutatenlisteDao = new ZutatenlisteDao(this._conn);
        
        var sql = 'SELECT * FROM Gericht';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result))
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].zubereitungsschritte = zubereitungsschritteDao.loadAllByParent(result[i].ID);
            result[i].speisenarten = speisenartDao.loadAllByGericht(result[i].ID);
            result[i].zutatenliste = zutatenlisteDao.loadAllByParent(result[i].ID);
        }        

        return helper.arrayObjectKeysToLower(result);
    }

    search(suchbegriff = '') {
        const zubereitungsschritteDao = new ZubereitungsschritteDao(this._conn);
        const speisenartDao = new SpeisenartDao(this._conn);
        const zutatenlisteDao = new ZutatenlisteDao(this._conn);
        
        var sql = 'SELECT * FROM Gericht WHERE Bezeichnung LIKE \'%' + suchbegriff + '%\'';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result))
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].zubereitungsschritte = zubereitungsschritteDao.loadAllByParent(result[i].ID);
            result[i].speisenarten = speisenartDao.loadAllByGericht(result[i].ID);
            result[i].zutatenliste = zutatenlisteDao.loadAllByParent(result[i].ID);
        }        

        return helper.arrayObjectKeysToLower(result);
    }

    loadBySpeisenart(speisenartId) {
        const zubereitungsschritteDao = new ZubereitungsschritteDao(this._conn);
        const speisenartDao = new SpeisenartDao(this._conn);
        const zutatenlisteDao = new ZutatenlisteDao(this._conn);

        var sql = 'SELECT * FROM Gericht WHERE ID IN (SELECT GerichtID FROM GerichtSpeisenart WHERE SpeisenartID=?)';
        var statement = this._conn.prepare(sql);
        var result = statement.all([speisenartId]);

       
        if (helper.isArrayEmpty(result))
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].zubereitungsschritte = zubereitungsschritteDao.loadAllByParent(result[i].ID);
            result[i].speisenarten = speisenartDao.loadAllByGericht(result[i].ID);
            result[i].zutatenliste = zutatenlisteDao.loadAllByParent(result[i].ID);
        }

        return helper.arrayObjectKeysToLower(result);

    }

    exists(id) {
        var sql = 'SELECT COUNT(ID) AS cnt FROM Gericht WHERE ID=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1)
            return true;

        return false;
    }

    update() {
        throw new Error('not implemented');
    }

    delete(id) {
        try {
            const zutatenlisteDao = new ZutatenlisteDao(this._conn);
            zutatenlisteDao.deleteByParent(id);
            const bewertungDao = new BewertungDao(this._conn);
            bewertungDao.deleteByParent(id);

            var sql = 'DELETE FROM Gericht WHERE ID=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1)
                throw new Error('Could not delete Record by id=' + id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Record by id=' + id + '. Reason: ' + ex.message);
        }
    }

    create(daten, bild) {
        helper.log('speichere neues gericht in der db');
        try {
            // eindeutigen Bildnamen erzeugen
            var neuerDateiname = fileHelper.createRandomFilename() + bild.name;
            // zielpfad für das bild
            // HINWEIS. Diese funktion wird eigentlich in der Datei service.js ausgeführt, daher ist dort unser Ausgangspunkt
            var zielpfad = '../frontend/bilder/' + neuerDateiname;
            helper.log('Zielpfad für Bild ' + zielpfad);
            // bild aus dem object als datei speichern
            bild.mv(zielpfad);
            // bildpfad erzeugen
            var bildpfad = 'bilder/' + neuerDateiname;
            helper.log('Bildpfad ' + bildpfad);

            // gericht datensatz einfügen
            var statement = this._conn.prepare('INSERT INTO Gericht (Bezeichnung, Bildpfad, Dauer) VALUES (?,?,?)');
            var params = [daten.name, bildpfad, daten.dauer];
            var result = statement.run(params);

            if (result.changes != 1) // wenn nicht 1 datensatz hinzugefügt wurde, fehler
                throw new Error('Konnte Gericht nicht speichern');

            // neue id holen
            var neueGerichtId = result.lastInsertRowid;
            helper.log('Id des gerichtes in der db ' + neueGerichtId);

            // GerichtSpeisenart hinzufügen
            for (i = 0; i < daten.speisenarten.length; i++) {
                statement = this._conn.prepare('INSERT INTO GerichtSpeisenart (GerichtID,SpeisenartID) VALUES (?,?)');
                statement.run([neueGerichtId, daten.speisenarten[i]]);
            }

            //GerichtZutaten hinzufügen
            for (i = 0; i < daten.zutaten.length; i++){
                statement = this._conn.prepare('INSERT INTO GerichtZutaten (GerichtID,ZutatID,Wert,EinheitID) VALUES (?,?,?,?)');
                statement.run([neueGerichtId, daten.zutaten[i].zutatenId, daten.zutaten[i].menge, daten.zutaten[i].einheitenId]);
            }

            // Zubereitungsschritte hinzufügen
            for (i = 0; i < daten.zubereitungsschritte.length; i++){
                statement = this._conn.prepare('INSERT INTO Zubereitungsschritte (GerichtID,Schritt,Anweisung) VALUES (?,?,?)');
                statement.run([neueGerichtId, i+1, daten.zubereitungsschritte[i].schritt]);
            }            

        } catch (ex) {
            throw new Error('Konnte Gericht nicht speichern');
        }
    }

    toString() {
        helper.log('GerichtDao [_conn=' + this._conn + ']');
    }
}

module.exports = GerichtDao;