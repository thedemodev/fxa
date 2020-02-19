/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const unbuf = require('buf').unbuf.hex;
// const buf = require('buf').hex;

const P = require('../../promise');

const config = require('../../../config');
const encrypt = require('../encrypt');
const logger = require('../logging')('db');
const mysql = require('./mysql');
const redis = require('../../redis');
const AccessToken = require('./accessToken');

class OauthDB {
  constructor() {
    this.mysql = mysql.connect(config.get('oauthServer.mysql'));
    this.mysql.then(async db => {
      await preClients();
      await scopes();
    });
    this.redis = redis({ enabled: true, prefix: 'oauth:' }, logger); //TODO oauth redis config
    Object.keys(mysql.prototype).forEach(key => {
      const self = this;
      this[key] = async function() {
        const db = await self.mysql;
        return db[key].apply(db, Array.from(arguments));
      };
    });
  }
  disconnect() {}

  async generateAccessToken(vals) {
    const token = new AccessToken(
      vals.clientId,
      vals.name,
      vals.canGrant,
      vals.publicClient,
      vals.userId,
      vals.email,
      vals.scope,
      null,
      null,
      vals.profileChangedAt,
      vals.expiresAt,
      vals.ttl
    );
    // TODO store pocket tokens in mysql and not redis
    await this.redis.setAccessToken(token);
    return token;
  }

  async getAccessToken(id) {
    const t = await this.redis.getAccessToken(id);
    if (t) {
      return t;
    }
    // some might only be in mysql
    // we can remove this code after all mysql tokens have expired
    const db = await this.mysql;
    return db._getAccessToken(id);
  }

  async removeAccessToken(id) {
    await this.redis.removeAccessToken(id);
    // some might only be in mysql
    // we can remove this code after all mysql tokens have expired
    const db = await this.mysql;
    return db._removeAccessToken(id);
  }

  async getActiveClientsByUid(uid) {
    const tokens = await this.redis.getAccessTokens(uid);
    const activeClientTokens = [];
    const now = new Date();
    for (const token of tokens) {
      if (token.expiresAt > now && !token.canGrant) {
        activeClientTokens.push(token);
      }
    }
    const db = await this.mysql;
    const refreshTokens = await db.getRefreshTokensByUid(uid);
    for (const token of refreshTokens) {
      const client = await this.getClient(token.clientId);
      activeClientTokens.push({
        id: token.clientId,
        createdAt: token.createdAt,
        lastUsedAt: token.lastUsedAt,
        name: client.name,
        scope: token.scope,
      });
    }
    // some might only be in mysql
    // we can remove this code after all mysql tokens have expired
    const olderTokens = await db._getActiveClientsByUid(uid);
    return activeClientTokens.concat(olderTokens);
  }

  async getAccessTokensByUid(uid) {
    const tokens = await this.redis.getAccessTokens(uid);
    // some might only be in mysql
    // we can remove this code after all mysql tokens have expired
    const db = await this.mysql;
    const olderTokens = await db._getAccessTokensByUid(uid);
    return tokens.concat(olderTokens);
  }

  async removePublicAndCanGrantTokens(userId) {
    await this.redis.removeAccessTokensForPublicClients(userId);
    // some might only be in mysql
    // we can remove this code after all mysql tokens have expired
    const db = await this.mysql;
    await db._removePublicAndCanGrantTokens(userId);
  }

  async deleteClientAuthorization(clientId, uid) {
    await this.redis.removeAccessTokensForUserAndClient(uid, clientId);
    const db = await this.mysql;
    await db._deleteClientAuthorization(clientId, uid);
  }

  async deleteClientRefreshToken(refreshTokenId, clientId, uid) {
    const db = await this.mysql;
    const ok = await db._deleteClientRefreshToken(
      refreshTokenId,
      clientId,
      uid
    );
    if (ok) {
      await this.redis.removeAccessTokensForUserAndClient(uid, clientId);
    }
  }

  async removeUser(uid) {
    await this.redis.removeAccessTokensForUser(uid);
    const db = await this.mysql;
    await db._removeUser(uid);
  }
}

function clientEquals(configClient, dbClient) {
  var props = Object.keys(configClient);
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    var configProp = unbuf(configClient[prop]);
    var dbProp = unbuf(dbClient[prop]);
    if (configProp !== dbProp) {
      logger.debug('clients.differ', {
        prop: prop,
        configProp: configProp,
        dbProp: dbProp,
      });
      return false;
    }
  }
  return true;
}

function convertClientToConfigFormat(client) {
  var out = {};

  for (var key in client) {
    if (key === 'hashedSecret' || key === 'hashedSecretPrevious') {
      out[key] = unbuf(client[key]);
    } else if (key === 'trusted' || key === 'canGrant') {
      out[key] = !!client[key]; // db stores booleans as 0 or 1.
    } else if (typeof client[key] !== 'function') {
      out[key] = unbuf(client[key]);
    }
  }
  return out;
}

function preClients() {
  var clients = config.get('oauthServer.clients');
  if (clients && clients.length) {
    logger.debug('predefined.loading', { clients: clients });
    return P.all(
      clients.map(function(c) {
        if (c.secret) {
          // eslint-disable-next-line no-console
          console.error(
            'Do not keep client secrets in the config file.' + // eslint-disable-line no-console
              ' Use the `hashedSecret` field instead.\n\n' +
              '\tclient=%s has `secret` field\n' +
              '\tuse hashedSecret="%s" instead',
            c.id,
            unbuf(encrypt.hash(c.secret))
          );
          return P.reject(
            new Error('Do not keep client secrets in the config file.')
          );
        }

        // ensure the required keys are present.
        var err = null;
        var REQUIRED_CLIENTS_KEYS = [
          'id',
          'hashedSecret',
          'name',
          'imageUri',
          'redirectUri',
          'trusted',
          'canGrant',
        ];
        REQUIRED_CLIENTS_KEYS.forEach(function(key) {
          if (!(key in c)) {
            var data = { key: key, name: c.name || 'unknown' };
            logger.error('client.missing.keys', data);
            err = new Error('Client config has missing keys');
          }
        });
        if (err) {
          return P.reject(err);
        }

        // ensure booleans are boolean and not undefined
        c.trusted = !!c.trusted;
        c.canGrant = !!c.canGrant;
        c.publicClient = !!c.publicClient;

        // Modification of the database at startup in production and stage is
        // not preferred. This option will be set to false on those stacks.
        if (!config.get('oauthServer.db.autoUpdateClients')) {
          return P.resolve();
        }

        return module.exports.getClient(c.id).then(function(client) {
          if (client) {
            client = convertClientToConfigFormat(client);
            logger.info('client.compare', { id: c.id });
            if (clientEquals(client, c)) {
              logger.info('client.compare.equal', { id: c.id });
            } else {
              logger.warn('client.compare.differs', {
                id: c.id,
                before: client,
                after: c,
              });
              return module.exports.updateClient(c);
            }
          } else {
            return module.exports.registerClient(c);
          }
        });
      })
    );
  } else {
    return P.resolve();
  }
}

/**
 * Insert pre-defined list of scopes into the DB
 */
function scopes() {
  var scopes = config.get('oauthServer.scopes');
  if (scopes && scopes.length) {
    logger.debug('scopes.loading', JSON.stringify(scopes));

    return P.all(
      scopes.map(function(s) {
        return module.exports.getScope(s.scope).then(function(existing) {
          if (existing) {
            logger.verbose('scopes.existing', s);
            return;
          }

          return module.exports.registerScope(s);
        });
      })
    );
  }
}

module.exports = new OauthDB();
