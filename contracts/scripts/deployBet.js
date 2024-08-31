async function main() {
    const bettingContract = await ethers.deployContract('Bet');
    await bettingContract.waitForDeployment();
    console.log("Betting contract deployed to:", bettingContract.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });