const databaseService = require('../../services/database.service');

describe('Database service', () => {
  it('loads the correct config', () => {
    const { config } = databaseService.client;
    expect(config.client).toBe('mysql');
    expect(config.connection.database).toBe('porygonTest');
    expect(config.connection.host).toBe('localhost');
    expect(config.connection.user).toBe('travis');
    expect(config.connection.password).toBe('');
  });

  it('successfully connects to the database', async () => {
    const result = await databaseService('migrations').select();
    expect(result.length).toBeGreaterThan(0);
  });
});
