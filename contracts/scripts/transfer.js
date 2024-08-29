async function main() {
    const [deployer] = await ethers.getSigners();
    const fanTokenAddress = "DEPLOYED_CONTRACT_ADDRESS";
    const FanToken = await ethers.getContractAt("FanToken", fanTokenAddress);
    const recipient = "0xB68918211aD90462FbCf75b77a30bF76515422CE";
    const amount = ethers.utils.parseUnits("0.10", 2);

    const tx = await FanToken.transfer(recipient, amount);
    await tx.wait();

    console.log(`Transferred ${amount.toString()} tokens to ${recipient}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });