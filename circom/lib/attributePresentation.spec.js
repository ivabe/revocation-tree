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
expect = chai.expect;

const config = getConfig('attributePresentation');
console.debug('config >>', JSON.stringify(config, null, 2));

const attributePresentation = async (inputJsonFile, testCaseMarker) => {
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

    return await readOutputJsonFile(pathToOutputJsonFile);
};


describe('attributePresentation.circom template', async function () {
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

        // const appendixCircuit = `\ncomponent main = AttributePresentation(4,13);`; The line is already there
        const appendixCircuit = '';
        await prepareTestCircomFile(pathToCircomFile, pathToCircomTestFile, appendixCircuit);

        await compileCircuit(pathToCircomTestFile, pathToTestFolder);
        await getSnarkjsInfo(r1csFile);

        await exec(`snarkjs zkey new ${r1csFile} ${powerOfTauFile} ${zkeyInitialFile}`).then(logger);
        await exec(`snarkjs zkey contribute ${zkeyInitialFile} ${zkeyFinalFile} --name="${fileName}" -e="random"`).then(logger);
        await exec(`snarkjs zkey export verificationkey ${zkeyFinalFile} ${verificationKeyFile}`).then(logger);
    });

    describe('AttributePresentation(4,13)', () => {


        it('Success test', async function () {
            const inputJsonFile = [
                "6936141895847827773039820306011898011976769516186037164536571405943971461449",
                "17251388444894072717477473574274222593987938315536802709728703916958893405064",
                "2709480763505578374265785946171450970079473123863887847949961070331954626384",
                "1",
                "16480984838845883908278887403998730505458370097797273028422755199897309800407",
                "0",
                "17239002221223401420981429812936542253273189731769780993527026392913274359324",
                "1234",
                "1696683841621",
                "0",
                "0",
                "0",
                "1"
            ];
            const outputJsonFile = await attributePresentation(inputJsonFile, "successful-");

            const expectedOutputJsonFile = [

            ];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);

        });

    });
});