const {
    prepareTestFolder,
    prepareTestCircomFile,
    compileCircuit,
    getSnarkjsInfo,
    writeInputJsonFile,
    exec,
    readOutputJsonFile,
    logger,
    getConfig,
} = require("./util/helper");
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
expect = chai.expect;
chai.use(chaiAsPromised);

const config = getConfig('merkleproof');
console.debug('config >>', JSON.stringify(config, null, 2));

const merkleProof = async (inputJsonFile, testCaseMarker) => {


    const {
        pathToTestFolder,
        testFileName,
        generateWitnessFile,
        wasmFile,
        wtnsFile,
        zkeyFinalFile,
        proofFile
    } = config;

    const pathToInputJsonFile = `${pathToTestFolder}/${testCaseMarker + testFileName}.input.json`;
    const pathToOutputJsonFile = `${pathToTestFolder}/${testCaseMarker + testFileName}.output.json`;
    console.debug('pathToInputJsonFile >> ', pathToInputJsonFile);
    console.debug('pathToOutputJsonFile >> ', pathToOutputJsonFile);

    await writeInputJsonFile(pathToInputJsonFile, inputJsonFile);

    await exec(`node ${generateWitnessFile} ${wasmFile} ${pathToInputJsonFile} ${wtnsFile}`).then(logger);
    await exec(`snarkjs groth16 prove ${zkeyFinalFile} ${wtnsFile} ${proofFile} ${pathToOutputJsonFile}`).then(logger);
};


describe('merkleproof.circom template', async function () {
    const {
        pathToTestFolder,
        pathToCircomFile,
        zkeyFinalFile,
        pathToCircomTestFile,
        r1csFile,
        powerOfTauFile,
        zkeyInitialFile,
        fileName,
        verificationKeyFile
    } = config;

    before(async function () {
        await prepareTestFolder(pathToTestFolder);

        const appendixCircuit = `\ncomponent main = MerkleProof(3);`;
        await prepareTestCircomFile(pathToCircomFile, pathToCircomTestFile, appendixCircuit);

        await compileCircuit(pathToCircomTestFile, pathToTestFolder);
        await getSnarkjsInfo(r1csFile);

        await exec(`snarkjs zkey new ${r1csFile} ${powerOfTauFile} ${zkeyInitialFile}`).then(logger);
        await exec(`snarkjs zkey contribute ${zkeyInitialFile} ${zkeyFinalFile} --name="${fileName}" -e="random"`).then(logger);
        await exec(`snarkjs zkey export verificationkey ${zkeyFinalFile} ${verificationKeyFile}`).then(logger);
    });

    describe('merkleProof(3)', () => {
        it('Success test', async function () {
            const inputJsonFile = {
                path: [0, 0, 0],
                lemma: [
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    1382129361768633036057174557812678057467005618241232823872788790752066157445n.toString(),
                    9681765776481265977901829530084985526310330812859580494580910966204997291130n.toString(),
                    5536145057333968474521785518927764270831250569884174013402440409261980981430n.toString(),
                ],
            };
            await expect(merkleProof(inputJsonFile, "successful-")).to.be.fulfilled;
        });

        it('Wrong path\'s length - shorter', async function () {
            const inputJsonFile = {
                path: [0, 0],
                lemma: [
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    1382129361768633036057174557812678057467005618241232823872788790752066157445n.toString(),
                    9681765776481265977901829530084985526310330812859580494580910966204997291130n.toString(),
                    5536145057333968474521785518927764270831250569884174013402440409261980981430n.toString(),
                ],
            };
            await expect(merkleProof(inputJsonFile, "wrong-path-shorter-")).to.be.rejected;
        });

        it('Wrong path\'s length - longer', async function () {
            const inputJsonFile = {
                path: [0, 0, 0, 0],
                lemma: [
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    1382129361768633036057174557812678057467005618241232823872788790752066157445n.toString(),
                    9681765776481265977901829530084985526310330812859580494580910966204997291130n.toString(),
                    5536145057333968474521785518927764270831250569884174013402440409261980981430n.toString(),
                ],
            };
            await expect(merkleProof(inputJsonFile, "wrong-path-longer-")).to.be.rejected;
        });

        it('Wrong lemma - 1 elem ', async function () {
            const inputJsonFile = {
                path: [0, 0, 0],
                lemma: [
                    28586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    1382129361768633036057174557812678057467005618241232823872788790752066157445n.toString(),
                    9681765776481265977901829530084985526310330812859580494580910966204997291130n.toString(),
                    5536145057333968474521785518927764270831250569884174013402440409261980981430n.toString(),
                ],
            };
            await expect(merkleProof(inputJsonFile, "wrong-lemma-1-")).to.be.rejected;
        });

        it('Wrong lemma - 2 elem ', async function () {
            const inputJsonFile = {
                path: [0, 0, 0],
                lemma: [
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    28586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    1382129361768633036057174557812678057467005618241232823872788790752066157445n.toString(),
                    9681765776481265977901829530084985526310330812859580494580910966204997291130n.toString(),
                    5536145057333968474521785518927764270831250569884174013402440409261980981430n.toString(),
                ],
            };
            await expect(merkleProof(inputJsonFile, "wrong-lemma-2-")).to.be.rejected;
        });

        it('Wrong lemma - 3 elem ', async function () {
            const inputJsonFile = {
                path: [0, 0, 0],
                lemma: [
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    2382129361768633036057174557812678057467005618241232823872788790752066157445n.toString(),
                    9681765776481265977901829530084985526310330812859580494580910966204997291130n.toString(),
                    5536145057333968474521785518927764270831250569884174013402440409261980981430n.toString(),
                ],
            };
            await expect(merkleProof(inputJsonFile, "wrong-lemma-3-")).to.be.rejected;
        });

        it('Wrong lemma - 4 elem ', async function () {
            const inputJsonFile = {
                path: [0, 0, 0],
                lemma: [
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    1382129361768633036057174557812678057467005618241232823872788790752066157445n.toString(),
                    2681765776481265977901829530084985526310330812859580494580910966204997291130n.toString(),
                    5536145057333968474521785518927764270831250569884174013402440409261980981430n.toString(),
                ],
            };
            await expect(merkleProof(inputJsonFile, "wrong-lemma-4-")).to.be.rejected;
        });

        it('Wrong lemma - 5 elem ', async function () {
            const inputJsonFile = {
                path: [0, 0, 0],
                lemma: [
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    1382129361768633036057174557812678057467005618241232823872788790752066157445n.toString(),
                    9681765776481265977901829530084985526310330812859580494580910966204997291130n.toString(),
                    3536145057333968474521785518927764270831250569884174013402440409261980981430n.toString(),
                ],
            };
            await expect(merkleProof(inputJsonFile, "wrong-lemma-5-")).to.be.rejected;
        });
    });
});