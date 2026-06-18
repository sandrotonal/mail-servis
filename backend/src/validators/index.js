const authValidators = require('./auth');
const workspaceValidators = require('./workspace');
const projectValidators = require('./project');
const formValidators = require('./form');

module.exports = {
  ...authValidators,
  ...workspaceValidators,
  ...projectValidators,
  ...formValidators,
};
