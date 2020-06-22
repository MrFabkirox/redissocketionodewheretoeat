var config = {
  REDISURL: "getEnv('REDISURL')",
  PORT: "getEnv('PORT')",
  PORT: 4000,
  FOURSQUAREID: "getEnv('FOURSQUAREID')",
  FOURSQUARESECRET: "getEnv('FOURSQUARESECRET')"
};
function getEnv(variable) {
  if(process.env[variable] === undefined) {
    throw new Error('Need env variable for ' + variable)
  }
  return process.env[variable];
}
module.exports = config;
