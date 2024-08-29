async function main() {
    const FanToken = await ethers.getContractFactory("FanToken");
    const fanToken = await FanToken.deploy();
    await fanToken.deployed();
    console.log("FanToken deployed to:", fanToken.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });