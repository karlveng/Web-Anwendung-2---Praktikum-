const helper = require('../helper.js');

class ZubereitungsschritteDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        var sql = 'SELECT * FROM Zubereitungsschritte WHERE ID=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result = helper.objectKeysToLower(result);

        result.gericht = { id: result.gerichtid };
        delete result.gerichtid;

        return result;
    }

    loadAll() {
        var sql = 'SELECT * FROM Zubereitungsschritte';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].gericht = { id: result[i].gerichtid };
            delete result[i].gerichtid;
        }

        return result;
    }

    loadAllByParent(id) {
        var sql = 'SELECT * FROM Zubereitungsschritte WHERE GerichtID=? ORDER BY Schritt ASC';
        var statement = this._conn.prepare(sql);
        var result = statement.all([id]);

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].gericht = { id: result[i].gerichtid };
            delete result[i].gerichtid;
        }

        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(ID) AS cnt FROM Zubereitungsschritte WHERE ID=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(gerichtid = 1, schritt = 1, anweisung = null) {
        var sql = 'INSERT INTO Zubereitungsschritte (GerichtID,Schritt,Anweisung) VALUES (?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [gerichtid, schritt, anweisung];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, gerichtid = 1, schritt = 1, anweisung = null) {
        var sql = 'UPDATE Zubereitungsschritte SET GerichtID=?,Schritt=?,Anweisung=? WHERE ID=?';
        var statement = this._conn.prepare(sql);
        var params = [gerichtid, schritt, anweisung, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM Zubereitungsschritte WHERE ID=?';
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
            var sql = 'DELETE FROM Zubereitungsschritte WHERE GerichtID=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Records by parent id=' + id + '. Reason: ' + ex.message);
        }
    }

    toString() {
        helper.log('ZubereitungsschritteDao [_conn=' + this._conn + ']');
    }
}

module.exports = ZubereitungsschritteDao;