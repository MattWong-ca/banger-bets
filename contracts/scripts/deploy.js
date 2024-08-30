async function main() {
    const fanToken = await ethers.deployContract('FanToken');
    await fanToken.waitForDeployment();
    console.log("FanToken deployed to:", fanToken.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });