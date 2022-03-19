const homie = artifacts.require("homie");

module.exports = function(deployer) {
  deployer.deploy(homie);
};