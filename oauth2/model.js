/*
 * Copyright 2015 Francesco Pontillo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var modelGenerator = function(crowdPulse) {
  var model = {};

  /**
   * Retrieves an access token from the database.
   * @param bearerToken The token to find
   * @param callback    Function to call with the result
   */
  model.getAuthCode = function(bearerToken, callback) {
    console.log('getAccessToken (bearerToken: ' + bearerToken + ')');
    crowdPulse.AccessToken.findOneByToken(bearerToken, callback);
  };

  /**
   * Saves an access token into the database.
   *
   * @param {String} token - The token to save.
   * @param {String} clientId - The client ID associated to the token.
   * @param {Date} expires - The expiration date of the token.
   * @param {String|Object} userId - The user ID or user object the token is bound to.
   * @param {Function} callback - Function to call with the result.
   */
  model.saveAccessToken = function(token, clientId, expires, userId, callback) {
    userId = typeof(userId) === 'object' ? userId._id.toString() : userId;
    console.log('saveAccessToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' +
                userId + ', expires: ' + expires + ')');
    var accessToken = new crowdPulse.AccessToken({
      accessToken: token,
      userId: userId,
      clientId: clientId,
      expires: expires
    });
    accessToken.save(callback);
  };

  /**
   * Search for a client application in the database.
   * @param clientId      The ID to find
   * @param clientSecret  The secret (has to match)
   * @param callback      Function to call with the result
   */
  model.getClient = function(clientId, clientSecret, callback) {
    console.log('getClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');
    if (clientSecret === null) {
      return crowdPulse.App.findById(clientId, callback);
    }
    crowdPulse.App.findOneByIdSecret(clientId, clientSecret, callback);
  };

  /**
   * Check if a client allows for a specific grant type.
   * @param clientId  The ID to find
   * @param grantType A specific grant type
   * @param callback  Function to call with the result
   */
  model.grantTypeAllowed = function(clientId, grantType, callback) {
    console.log('grantTypeAllowed (clientId: ' + clientId + ', grantType: ' + grantType + ')');
    crowdPulse.App.hasAllowedGrant(clientId, grantType, callback);
  };

  /**
   * Finds a user ID given its username and a password.
   * @param username  The username
   * @param password  The password
   * @param callback  Function that will be called with the user ID as an argument, or null if no
   *   users were found
   */
  model.getUser = function(username, password, callback) {
    console.log('getUser (username: ' + username + ', password: ' + password + ')');
    crowdPulse.User.findOneIdByNameSecret(username, password, callback);
  };

  model.getUserFromClient = function(clientId, clientSecret, callback) {
    return model.getClient(clientId, clientSecret, callback);
  };

  /**
   * Saves the refresh token, bound to a client, a user and an expiration date.
   * @param token     The token to save
   * @param clientId  The associated app ID
   * @param expires   The expiration date for the token
   * @param userId    The associated app ID
   * @param callback  Function to be called with the result
   */
  model.saveRefreshToken = function(token, clientId, expires, userId, callback) {
    console.log('saveRefreshToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' +
                userId + ', expires: ' + expires + ')');
    var refreshToken = new crowdPulse.RefreshToken({
      refreshToken: token,
      userId: userId,
      clientId: clientId,
      expires: expires
    });
    refreshToken.save(callback);
  };

  /**
   * Gets a refresh token from the database.
   * @param refreshToken  The refresh token to look for
   * @param callback      Function to be called with the result
   */
  model.getRefreshToken = function(refreshToken, callback) {
    console.log('in getRefreshToken (refreshToken: ' + refreshToken + ')');
    crowdPulse.RefreshToken.findOneByToken(refreshToken, callback);
  };

  return model;
};

module.exports = modelGenerator;
