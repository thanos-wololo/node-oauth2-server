'use strict';

/**
 * Module dependencies.
 */

const AuthorizationCodeGrantType = require('../../../lib/grant-types/authorization-code-grant-type');
const Promise = require('bluebird');
const Request = require('../../../lib/request');
const sinon = require('sinon');
const should = require('chai').should();

/**
 * Test `AuthorizationCodeGrantType`.
 */

describe('AuthorizationCodeGrantType', function() {
  describe('getAuthorizationCode()', function() {
    it('should call `model.getAuthorizationCode()`', function() {
      const model = {
        getAuthorizationCode: sinon.stub().returns({ authorizationCode: 12345, client: {}, expiresAt: new Date(new Date() * 2), user: {} }),
        revokeAuthorizationCode: function() {},
        saveToken: function() {}
      };
      const handler = new AuthorizationCodeGrantType({ accessTokenLifetime: 120, model: model });
      const request = new Request({ body: { code: 12345 }, headers: {}, method: {}, query: {} });
      const client = {};

      return handler.getAuthorizationCode(request, client)
        .then(function() {
          model.getAuthorizationCode.callCount.should.equal(1);
          model.getAuthorizationCode.firstCall.args.should.have.length(2);
          model.getAuthorizationCode.firstCall.args[0].should.equal(12345);
          model.getAuthorizationCode.firstCall.thisValue.should.equal(model);
        })
        .catch(should.fail);
    });
  });

  describe('revokeAuthorizationCode()', function() {
    it('should call `model.revokeAuthorizationCode()`', function() {
      const model = {
        getAuthorizationCode: function() {},
        revokeAuthorizationCode: sinon.stub().returns(true),
        saveToken: function() {}
      };
      const handler = new AuthorizationCodeGrantType({ accessTokenLifetime: 120, model: model });
      const authorizationCode = {};

      return handler.revokeAuthorizationCode(authorizationCode)
        .then(function() {
          model.revokeAuthorizationCode.callCount.should.equal(1);
          model.revokeAuthorizationCode.firstCall.args.should.have.length(2);
          model.revokeAuthorizationCode.firstCall.args[0].should.equal(authorizationCode);
          model.revokeAuthorizationCode.firstCall.thisValue.should.equal(model);
        })
        .catch(should.fail);
    });
  });

  describe('saveToken()', function() {
    it('should call `model.saveToken()`', function() {
      const client = {};
      const user = {};
      const model = {
        getAuthorizationCode: function() {},
        revokeAuthorizationCode: function() {},
        saveToken: sinon.stub().returns(true)
      };
      const handler = new AuthorizationCodeGrantType({ accessTokenLifetime: 120, model: model });

      sinon.stub(handler, 'validateScope').returns('foobiz');
      sinon.stub(handler, 'generateAccessToken').returns(Promise.resolve('foo'));
      sinon.stub(handler, 'generateRefreshToken').returns(Promise.resolve('bar'));
      sinon.stub(handler, 'getAccessTokenExpiresAt').returns(Promise.resolve('biz'));
      sinon.stub(handler, 'getRefreshTokenExpiresAt').returns(Promise.resolve('baz'));

      return handler.saveToken(user, client, 'foobar', 'foobiz')
        .then(function() {
          model.saveToken.callCount.should.equal(1);
          model.saveToken.firstCall.args.should.have.length(4);
          model.saveToken.firstCall.args[0].should.eql({ accessToken: 'foo', authorizationCode: 'foobar', accessTokenExpiresAt: 'biz', refreshToken: 'bar', refreshTokenExpiresAt: 'baz', scope: 'foobiz' });
          model.saveToken.firstCall.args[1].should.equal(client);
          model.saveToken.firstCall.args[2].should.equal(user);
          model.saveToken.firstCall.thisValue.should.equal(model);
        })
        .catch(should.fail);
    });
  });
});
