function fn() {
  var env = karate.env; // get system property 'karate.env'
  karate.log('karate.env system property was:', env);
  
  if (!env) {
    env = 'dev';
  }
  
  var config = {
    env: env,
    baseUrl: 'http://localhost:5000',
    frontendUrl: 'http://localhost:3000',
    testUser: {
      email: 'test3@mail.com',
      password: 'testul3',
      username: 'testuser'
    }
  };
  
  if (env === 'dev') {
    config.baseUrl = 'http://localhost:5000';
  } else if (env === 'prod') {
    config.baseUrl = 'https://api.javaverse.com';
  }
  
  return config;
}