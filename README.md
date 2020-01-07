# Backend REST API #

[![Version](https://img.shields.io/github/package-json/v/ahugues/porygon-backend)](https://github.com/aHugues/porygon-backend)
[![Build Status](https://travis-ci.org/aHugues/porygon-backend.svg?branch=master)](https://travis-ci.org/aHugues/porygon-backend)
[![codecov](https://codecov.io/gh/aHugues/porygon-backend/branch/master/graph/badge.svg)](https://codecov.io/gh/aHugues/porygon-backend)
![GitHub](https://img.shields.io/github/license/ahugues/porygon-backend)

REST API Using Express to link the Porygon application to a SQL database with authentication using 
a Keycloak server.

## Installation ##

### Prerequesites ###

You need **Node.JS** (version 8 or later) and **MySQL** to install the application.


### Installation Procedure ###

#### Creating the database to be accessed ####

This procedure is the same for every operating system.

In the **MySQL Shell**, create a new database `CREATE DATABASE your_database_name;`.

Create a new user to access it `GRANT ALL PRIVILEGES ON your_database_name.* TO your_user IDENTIFIED BY your_password;`

This last command is not necessary as you can use the **root** account, but it is not advisable.

You need to create a config file in `./config/` containing the credentials for the database. It should have the corresponding structure:

```json
database.config.json
---

{
    "production": {
        "client": "mysql",
        "driver": "mysql",
        "password": "<your_password>", 
        "host": "<host>",
        "database": "<your_database_name>",
        "user": "<your_user>"
    }
}
```

Run the migrations: 

```shell
db-migrate --config config/database.config.json -e production up
```

Or for a dev environment, replace `production` by `development` and run 

```shell
db-migrate --config config/database.config.json up
```

### Configure the authentication

The application uses Keycloak for IAM and authentication. To link to your server, 
download the JSON OpenID file and put it into the config folder: 

>Note: This step is not required if running in a development environment as authentication
is automatically bypassed. 

```json
keycloak.config.json
---

{
    "realm": "<realm_name>",
    "realm-public-key": "<realm_public_key",
    "auth-server-url": "keycloak_url",
    "ssl-required": "<ssl_required>",
    "resource": "<client_id>",
    "verify-token-audience": <token_audience_verified>,
    "credentials": {
      "secret": "<secret_key>"
    },
    "use-resource-role-mappings": <use_resource_role_mappings>,
    "confidential-port": <confidential_port>,
    "policy-enforcer": {}
}
```

### Configure the server

Server configuration can be set using the file `./config/server.config.json`

```json
server.config.json

{
    "server": {
        "host": "127.0.0.1",
        "port": 4000,
        "version": 1,
        "frontendOrigin": "http://127.0.0.1:8080",
        "logLevel": "info",
        "logDirectory": "logs"
    },
    "doc": {
        "baseHost": "localhost:4000"
    },
    "secretKey": "placeholderToBeChanged",
}
```

| Value | Role |
| ---: | :--- |
| `server.host` | Host the server will listen to. Set it to `0.0.0.0` if you want your server to listen to all routes, or `127.0.0.1` if you are behind a reverse proxy |
| `server.port` | The port the server will listen to |
| `server.version` | Value automatically appended to all API routes, e.g. `http://localhost:4000/api/v1/movies` |
| `server.frontendOrigin` | Used by the `Access-Control` to limit the origin of requests. It should be set to the frontend host, e.g. `https://porygon.example.com` |
| `server.logLevel` | Log level for the server logger, can be set to `"debug"`, `"info"`, `"warning"`, `"error"` |
| `server.logDirectory` | Path into which log files are stored. Can be an absolute path or a relative path starting from the project root |
| `doc.baseHost` | The host (as seen by the end user) for the documentation to generate test URLs, e.g. `https://api.porygon.example.com` |
| `secretKey` | The secret key using to encrypt session tokens. It should be set a random string using a safe generator, e.g. `openssl rand -base64 32` |



#### Installing the application ####

Go to the root folder and install the application `npm install`

## Usage ##

### Running the application

Launch the application with `npm start`.

The functions are accessible with `http://your_host:4000/api/v1...`. Of course the port can be adjusted using `./config/server.config.json` to use what you need.

In `dev` mode, all logs output to the terminal.

### Deployment to production

The environment can be set using `NODE_ENV=production npm start`. However, it is 
advised to use a proper process manager when running in production, such as `pm2`. 

In `production` mode, logs output to three log files: 
- `server.log`: output by the logger, only `debug`, `info` and `warn` levels
- `error.log`: output by the logger, at least on `error` level
- `access.log`: logs of users requests

### Docker

A Docker container is available at `ahugues/porygon-backend`. It uses a volume called `/config` to 
set the database and optionnal keycloak config files and a `/logs` volume to store the log files. 

For this reason, the `server.logDirectory` should be set to `/logs` in order for the logs to be visible 
outside the container

If necessary to access the database, the host networking can be used with the flag `--network="host"`.

Images are tagged along three axes: 
- `:master`: latest `master` successfull build
- `:latest`: latest successfull tagged build (latest release)
- :`vx.y`: specific tag (latest tag is identical to the `:latest` tag)

Launch the Docker container using:

```shell
docker run --network="host" -e NODE_ENV=production -v "$(pwd)/config":/config -v "$(pwd)/logs":/logs ahugues/porygon-backend:latest
```