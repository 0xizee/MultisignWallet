const {devlopmentChains} = require("../helper-hardhat-config")
const { ethers, network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async function({getNamedAccounts,deployments}){
    const {deployer} = await getNamedAccounts();
    const {deploy,log} = deployments;

    let args;

    if(devlopmentChains.includes(network.name)){
    const Accounts = await ethers.getSigners();
    const playerOne = Accounts[1];
    const playerTwo =Accounts[2];
    const playerThree = Accounts[3];
    args = [2,[playerOne.address,playerTwo.address,playerThree.address]];
    }
    else{
        args = [2,["0xbB36F6C879e5751de0eA22aa9D6Ed463cCD876E6","0x87eA22A0D0c788C2f223d3eAC004D5568672A341","0xDF94a0F46e99Ca6F63Fa5E354fB6229F225Aed56"]];
    }
    const MultiSignWallet = await deploy("MultiSignWallet",{
        from : deployer,
        args :args,
        log : true
    });

    if(!devlopmentChains.includes(network.name)){
        log("Verfying Contract");
        await verify(MultiSignWallet.address,args);
    }
}

module.exports.tags = ["all","Multisign"];