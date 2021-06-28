const helper = require('../helper.js');
const SpeisenartDao = require('./speisenartDao.js');
const GerichtDao = require('./gerichtDao.js');

class GerichtSpeisenartDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadAll() {
        //const gerichtDao = new GerichtDao(this._conn);
        //var meals = gerichtDao.loadAll();
        //const speisenartDao = new SpeisenartDao(this._conn);
        //var categories = speisenartDao.loadAll();
        //const gerichtspeisenartDao = new GerichtDao(this._conn);
        //varconst GerichtSpeisenartDao = require('../dao/gerichtDao.js');
        var sql = 'SELECT * FROM GerichtSpeisenart';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result))
            return [];

        result = helper.arrayObjectKeysToLower(result);

        //for (var i = 0; i < result.length; i++) {

        //result[i].gericht = { 'gerichtid': result[i].gerichtid };
        //delete result[i].gerichtid;

        //for (var element of categories) {
        //   if (element.id == result[i].speisenartid) {
        //     result[i].speisenart = element;
        //    break;
        // }
        //}
        //delete result[i].speisenartid;

        //}

        return result;
    }

    loadAllByParent(id) {
        const gerichtDao = new GerichtDao(this._conn);
        var meals = gerichtDao.loadAll();
        const speisenartDao = new SpeisenartDao(this._conn);
        var categories = speisenartDao.loadAll();

        var sql = 'SELECT * FROM GerichtSpeisenart WHERE GerichtID=?';
        var statement = this._conn.prepare(sql);
        var result = statement.all(id);

        if (helper.isArrayEmpty(result))
            return [];

        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].gericht = { 'id': result[i].gerichtid };
            delete result[i].gerichtid;

            for (var element of categories) {
                if (element.id == result[i].speisenartid) {
                    result[i].speisenart = element;
                    break;
                }
            }
            delete result[i].speisenartid;

            return result;

        }
    }

    create(gerichtid, speisenartID) {
        var sql = 'INSERT INTO GerichtSpeisenart (GerichtID,SpeisenartID) VALUES (?,?)';
        var statement = this._conn.prepare(sql);
        var params = [gerichtid, speisenartid];
        var result = statement.run(params);

        if (result.changes != 1)
            throw new Error('Could not insert new Record. Data: ' + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM GerichtZutaten WHERE ID=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1)
                throw new Error('Could not delete Record by Id=' + id);

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
        helper.log('GerichtzutatenDao [_conn=' + this._conn + ']');
    }
}

module.exports = GerichtSpeisenartDao;