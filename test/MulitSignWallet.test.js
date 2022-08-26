const { assert, expect } = require("chai");
const { deployments, network, ethers } = require("hardhat");
const { resolveConfig } = require("prettier");
const { devlopmentChains } = require("../helper-hardhat-config");

!devlopmentChains.includes(network.name)
  ? describe.skip
  : describe("MultiSignWallet", () => {
      let accounts,
        MultiSignWallet,
        playerOne,
        playerTwo,
        playerFour,
        playerThree,
        ContractTest,
        data,
        Amount;
      beforeEach("Deploy", async function () {
        await deployments.fixture(["all"]);
        accounts = await ethers.getSigners();
        playerOne = accounts[1];
        playerTwo = accounts[2];
        playerThree = accounts[3];
        playerFour = accounts[4];
        MultiSignWallet = await ethers.getContract(
          "MultiSignWallet",
          accounts[0]
        );
        ContractTest = await ethers.getContract("TestContract", accounts[0]);
        Amount = ethers.utils.parseEther("1");
        data = "0xb8e010de";
      });

      async function playerOneConnect() {
        const playerOneconnect = await MultiSignWallet.connect(playerOne);
        const transaction = await playerOneconnect.CreateTransaction(
          Amount,
          ContractTest.address,
          data
        );
      }

      describe("Set the Construct to be right", () => {
        it("Should check the threshold and check whether every address is set properly", async function () {
          const threshold = await MultiSignWallet.threshold();
          assert.equal(threshold.toString(), "2");
          const playerOneAddress = await MultiSignWallet.checkIsOwner(
            playerOne.address
          );
          assert.equal(playerOneAddress.toString(), "true");
          const playerTwoAddress = await MultiSignWallet.checkIsOwner(
            playerTwo.address
          );
          assert.equal(playerTwoAddress.toString(), "true");
          const playerThreeAddress = await MultiSignWallet.checkIsOwner(
            playerThree.address
          );
          assert.equal(playerThreeAddress.toString(), "true");
        });
      });
      describe("CreateTransaction", () => {
        it("Revert when isOwner  is not false", async function () {
          const playerFourConnect = await MultiSignWallet.connect(playerFour);
          await expect(
            playerFourConnect.CreateTransaction(
              Amount,
              ContractTest.address,
              data
            )
          ).to.be.revertedWith("NOTOwner");
        });
        it("Sees whether transaction was pushed inside the array or not", async function () {
          await playerOneConnect();
          const getTransaction = await MultiSignWallet.getTransaction(0);
          assert.equal(
            getTransaction.toString(),
            "1000000000000000000,0x5FbDB2315678afecb367f032d93F642f64180aa3,0xb8e010de,false"
          );
        });
        it("Emit an event in CreateTransaction", async function () {
          const playerOneTOCheck = await MultiSignWallet.connect(playerOne);
          await expect(
            playerOneTOCheck.CreateTransaction(
              Amount,
              ContractTest.address,
              data
            )
          )
            .to.emit(MultiSignWallet, "TransactionCreate")
            .withArgs(Amount, ContractTest.address, data);
        });
      });

      describe("Approve", () => {
        it("Check whether youare owner or not", async function () {
          await playerOneConnect();
          const playerFourConnect = await MultiSignWallet.connect(playerFour);
          await expect(playerFourConnect.Approve(0)).to.be.revertedWith(
            "NOTOwner"
          );
        });
        it("Set That index to be true", async function () {
          await playerOneConnect();
          const playerThreeConnect = await MultiSignWallet.connect(playerThree);
          const Approve = await playerThreeConnect.Approve(0);
          const ProposalVoted = await playerThreeConnect.ProposalVoted(0);
          assert.equal(ProposalVoted.toString(), "true");
        });
      });

      describe("Execute Transaction", () => {
        it("iF YOU are not owner ,revert", async function () {
          await playerOneConnect();
          const playerFourConnect = await MultiSignWallet.connect(playerFour);
          await expect(
            playerFourConnect.executeTransaction(0)
          ).to.be.revertedWith("NOTOwner");
        });
        it("If count is less than threshold", async function () {
          await playerOneConnect();
          const playerTwoConnect = await MultiSignWallet.connect(playerTwo);
          const playerTwoVote = await playerTwoConnect.Approve(0);
          await expect(
            playerTwoConnect.executeTransaction(0)
          ).to.be.revertedWith("RequireThreshold");
        });
        it("Add money and send to That contract", async function () {
          await playerOneConnect();
          const TestContractBefore = await ContractTest.number();
          const ownerBefore = await ContractTest.owner();
          await playerOne.sendTransaction({
            to: MultiSignWallet.address,
            value: ethers.utils.parseEther("10"),
          });
          const playerTwoConnect = await MultiSignWallet.connect(playerTwo);
          const playerTwoVote = await playerTwoConnect.Approve(0);
          const playerThreeConnect = await MultiSignWallet.connect(playerThree);
          const playerThreeVote = await playerThreeConnect.Approve(0);
          const playerTwoTOExecuteTheTransaction =
            await playerTwoConnect.executeTransaction(0);
          const AfterNumeber = await ContractTest.number();
          const AfterOwner = await ContractTest.owner();
          assert.equal(TestContractBefore.toString(), "0");
          assert.equal(
            ownerBefore.toString(),
            "0x0000000000000000000000000000000000000000"
          );
          assert.equal(
            AfterNumeber.toString(),
            ethers.utils.parseEther("1").toString()
          );
          assert.equal(
            AfterOwner.toString(),
            MultiSignWallet.address.toString()
          );
        });
      });
    });
