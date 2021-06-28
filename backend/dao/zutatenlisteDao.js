const helper = require('../helper.js');
const ZutatDao = require('./zutatDao.js');
const EinheitDao = require('./einheitDao.js');

class ZutatenlisteDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const zutatDao = new ZutatDao(this._conn);
        const einheitDao = new EinheitDao(this._conn);

        var sql = 'SELECT * FROM GerichtZutaten where id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result))
            throw new Error('No Record found by id=' + id);

        result = helper.objectKeysToLower(result);

        result.gericht = { id: result.gerichtid };
        delete result.gerichtid;

        result.zutat = zutatDao.loadById(result.zutatid);
        delete result.zutatid;

        result.einheit = einheitDao.loadById(result.einheitid);
        delete result.einheitid;

        return result;
    }

    loadAll() {
        const zutatDao = new ZutatDao(this._conn);
        var ingredients = zutatDao.loadAll();
        const einheitDao = new EinheitDao(this._conn);
        var measures = einheitDao.loadAll();

        var sql = 'SELECT * FROM GerichtZutaten';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result))
            return [];

        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].gericht = { 'id': result[i].gerichtid };
            delete result[i].gerichtid;

            for (var element of ingredients) {
                if (element.id == result[i].zutatid) {
                    result[i].zutat = element;
                    break;
                }
            }
            delete result[i].zutatid;

            for (var element of measures) {
                if (element.id == result[i].einheitid) {
                    result[i].einheit = element;
                    break;
                }
            }
            delete result[i].einheitid;
        }

        return result;
    }

    loadAllByParent(id) {
        const zutatDao = new ZutatDao(this._conn);
        var ingredients = zutatDao.loadAll();
        const einheitDao = new EinheitDao(this._conn);
        var measures = einheitDao.loadAll();

        var sql = 'SELECT * FROM GerichtZutaten WHERE GerichtID=?';
        var statement = this._conn.prepare(sql);
        var result = statement.all(id);

        if (helper.isArrayEmpty(result))
            return [];

        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].gericht = { 'id': result[i].gerichtid };
            delete result[i].gerichtid;

            for (var element of ingredients) {
                if (element.id == result[i].zutatid) {
                    result[i].zutat = element;
                    break;
                }
            }
            delete result[i].zutatid;

            for (var element of measures) {
                if (element.id == result[i].einheitid) {
                    result[i].einheit = element;
                    break;
                }
            }
            delete result[i].einheitid;
        }

        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(ID) AS cnt FROM GerichtZutaten WHERE ID=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1)
            return true;

        return false;
    }

    create(gerichtid = 1, zutatid = 1, wert = 1, einheitid = 1) {
        var sql = 'INSERT INTO GerichtZutaten (GerichtID,ZutatID,Wert,EinheitID) VALUES (?,?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [gerichtid, zutatid, wert, einheitid];
        var result = statement.run(params);

        if (result.changes != 1)
            throw new Error('Could not insert new Record. Data: ' + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, gerichtid = 1, zutatid = 1, wert = 1, einheitid = 1) {
        var sql = 'UPDATE GerichtZutaten SET GerichtID=?,ZutatID=?,Wert=?,EinheitID=? WHERE ID=?';
        var statement = this._conn.prepare(sql);
        var params = [gerichtid, zutatid, wert, einheitid, id];
        var result = statement.run(params);

        if (result.changes != 1)
            throw new Error('Could not update existing Record. Data: ' + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM GerichtZutaten WHERE ID=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1)
                throw new Error('Could not delete Record by id=' + id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Record by id=' + id + '. Reason: ' + ex.message);
        }
    }

    deleteByParent(id) {
        try {
            var sql = 'DELETE FROM GerichtZutaten WHERE GerichtID=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Records by parent id=' + id + '. Reason: ' + ex.message);
        }
    }

    toString() {
        helper.log('ZutatenlisteDao [_conn=' + this._conn + ']');
    }
}

module.exports = ZutatenlisteDao;