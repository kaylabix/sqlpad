const assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const TestUtils = require('../utils');

describe('api/password-reset', function() {
  const utils = new TestUtils();

  async function setReset() {
    const user = await utils.models.users.findOneByEmail('admin@test.com');
    const passwordResetId = uuidv4();
    user.passwordResetId = passwordResetId;
    await utils.models.users.update(user);
    return passwordResetId;
  }

  before(function() {
    return utils.init(true);
  });

  it('Allows resetting password', async function() {
    const passwordResetId = await setReset();
    const body = await utils.post(
      'admin',
      `/api/password-reset/${passwordResetId}`,
      {
        email: 'admin@test.com',
        password: 'admin',
        passwordConfirmation: 'admin'
      }
    );
    assert(!body.error, 'Expect no error');
  });

  it('Errors for wrong passwordResetId', async function() {
    await setReset();
    const body = await utils.post('admin', `/api/password-reset/123`, {
      email: 'admin@test.com',
      password: 'admin',
      passwordConfirmation: 'admin'
    });
    assert(body.error, 'Expect error');
  });

  it('Errors for wrong email', async function() {
    const passwordResetId = await setReset();
    const body = await utils.post(
      'admin',
      `/api/password-reset/${passwordResetId}`,
      {
        email: 'wrongemail@test.com',
        password: 'admin',
        passwordConfirmation: 'admin'
      }
    );
    assert(body.error, 'Expect error');
  });

  it('Errors for mismatched passwords', async function() {
    const passwordResetId = await setReset();
    const body = await utils.post(
      'admin',
      `/api/password-reset/${passwordResetId}`,
      {
        email: 'admin@test.com',
        password: 'admin2',
        passwordConfirmation: 'admin'
      }
    );
    assert(body.error, 'Expect error');
  });
});
