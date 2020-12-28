#!/usr/bin/env node

// TMP script to create users before having a more reliable way of doing it

const readline = require('readline');
const AuthService = require('./services/auth.service');
const Cleanup = require('./middlewares/cleanup');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let createdUser = {};

function promptUser() {
  rl.question('Enter username\n', (username) => {
    createdUser.login = username;
    rl.question('Enter password\n', (password) => {
      createdUser.password = password;
      rl.question('Enter first name\n', (firstName) => {
        createdUser.firstName = firstName;
        rl.question('Enter last name\n', (lastName) => {
          createdUser.lastName = lastName;
          rl.question('Enter email (leave empty for none)\n', (email) => {
            createdUser.email = email;
            rl.close();
          });
        });
      });
    });
  });

  rl.on('close', () => {
    const onNext = () => {};
    const onComplete = () => {
      console.log(`User ${createdUser.username} successfully created`);
      process.exit(0);
    };
    const onError = (error) => {
      console.error(`Error creating user: ${JSON.stringify(error)}`);
      process.exit(1);
    };
    AuthService.createUser(createdUser).subscribe(onNext, onError, onComplete);
  });

}

promptUser()
