const databaseService = require('../../services/database.service');

describe('Database service', () => {
  it('loads the correct config', () => {
    const { config } = databaseService.client;
    expect(config.client).toBe('mysql');
    expect(config.connection.database).toBe('porygonTest');
    expect(config.connection.host).toBe('localhost');
    expect(config.connection.user).toBe('azure');
    expect(config.connection.password).toBe('azure');
  });

  it('successfully connects to the database', async () => {
    const result = await databaseService('migrations').select();
    expect(result.length).toBeGreaterThan(0);
    databaseService.destroy();
  });
});
