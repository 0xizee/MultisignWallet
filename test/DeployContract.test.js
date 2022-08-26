
const {devlopmentChains} = require("../helper-hardhat-config")
const {deployments,ethers} = require("hardhat")
// const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { expect, assert } = require("chai")

!devlopmentChains.includes(network.name)
 ?describe.skip
 :describe("Deploy",async function(){
    let TestContract , playerOne,accounts
    beforeEach(async function(){
        await deployments.fixture(["ContractTest"]);
         accounts = await ethers.getSigners();
        playerOne = accounts[1];
        TestContract = await ethers.getContract("TestContract",accounts[0]);
        console.log("Contract was deployed ");
    }) 
    describe('set', () => { 
        it("send one eth",async function(){
            await expect(TestContract.set()).to.be.revertedWith("Require more than One ETH");
        })
        it("Should set the owner and msg.value inside the state",async function(){
            const set = await TestContract.set({value:ethers.utils.parseEther("1")});
            const number = await TestContract.number();
            const owner = await TestContract.owner();
            assert.equal(number.toString(),ethers.utils.parseEther("1").toString());
            assert.equal(owner.toString(),accounts[0].address.toString());
        })
     })
     describe('GetData', () => { 
        it("Return the bytes",async function(){
        await expect(TestContract.getSet()).to.emit(TestContract,"getData").withArgs("0xb8e010de");
    })
      })
 })