const rxjs = require('rxjs');
const knex = require('./database.service');
const cleanup = require('../middlewares/cleanup');

const service = {};


const getAllCommands = (order) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Command').orderBy(order[0], order[1]).select()
      .then((commands) => {
        obs.next(commands);
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const getCommandById = (id) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Command').where('id', id).select()
      .then((command) => {
        if (command.length < 1) {
          const error = new Error(`Command with id ${id} not found.`);
          error.statusCode = 404;
          throw error;
        } else {
          obs.next(command);
          obs.complete();
        }
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const createCommand = (fields) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Command').insert(cleanup.removeNulls(fields))
      .then((instance) => {
        obs.next(instance);
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const updateCommand = (id, fields) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Command').where('id', id).update(cleanup.removeNulls(fields))
      .then((affectedRows) => {
        obs.next(affectedRows > 0);
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


const deleteCommand = (id) => {
  const observable = rxjs.Observable.create((obs) => {
    knex('Command').where('id', id).delete()
      .then(() => {
        obs.complete();
      })
      .catch((error) => {
        obs.error(error);
      });
  });
  return observable;
};


service.getAllCommands = getAllCommands;
service.getCommandById = getCommandById;
service.createCommand = createCommand;
service.updateCommand = updateCommand;
service.deleteCommand = deleteCommand;

module.exports = service;
