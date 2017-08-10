/*jshint evil: true, boss: true, node: true*/
module.exports = {
  Creds:{
      sid: 'bacon',
      auth_token: 'pants'
  },
  process_url: {
    dev: 'http://localhost:3000',
    staging: 'https://process-test.pipes.io',
    prod: 'https://process.pipes.io'
  },
  Database: {
    dev: {
      name: 'pipes_dev',
      user: 'root',
      password: null
    },
    test: {
      name: 'pipes_test',
      user: 'root',
      password: null
    },
    staging:{
      name: 'pipes_staging',
      user: 'root',
      password: null
    },
    prod:{
      name: 'pipes',
      user: 'root',
      password: null
    }
  } 
};
