const { network } = require("hardhat");
const {devlopmentChains} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async function({getNamedAccounts,deployments}){

    const {deploy,log} = deployments;
    const {deployer} = await getNamedAccounts();

    const TestContract = await deploy("TestContract",{
        from : deployer,
        args :[],
        log : true 
    });

    if(!devlopmentChains.includes(network.name)){
        log("VerifyContract")
        await verify(TestContract.address,[]);
    }
}

module.exports.tags = ["all","ContractTest"];