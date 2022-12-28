const expect = require('chai').expect;
const assert = require('chai').assert;
const fs = require('fs').promises;

const {MerkleTree} = require('./crypto/merkleTree');
const {merklePoseidon} = require('./crypto/poseidon.js');

const generateZeroArray = (numberOfLeaves, mapOfPositions = []) => {
    const zeroArray = new Array(numberOfLeaves).fill(0);
    mapOfPositions.forEach((position, value) => {
        zeroArray[position] = value;
    });
    return zeroArray;
};

const testMerkleProofBit = (MerkleTree, position) => {
    // Given a Merkle Tree, generate a proof for a given index
    // Lemma lenght is depth + 2
    const proof = MerkleTree.generateProof(position);

    // Test output sizes
    // lemma = index_value, neighbour, intermediary_nodes, root
    expect(proof.lemma.length).to.equal(MerkleTree.depth + 2);
    expect(proof.path.length).to.equal(MerkleTree.depth);
    // test proof validation - validate()
    expect(proof.validate()).to.equal(true);
    //Tamper the proof 
    const tamper = proof.lemma[proof.lemma.length - 1];
    proof.lemma[0] = tamper;
    expect(proof.validate()).to.equal(false);
};

describe('MerkleTree class', () => {
    let merkleTree;
    before(async () => {
        const input = [1,1,2,2,3,3,4,4];
        merkleTree = new merklePoseidon(input);
    });

    after(async () => {
        console.debug('Debug -> after: cleaning after testing');
    });

    describe('Tree generation', () => {
        const zeroArray = generateZeroArray(8);
        const merkleTree = merklePoseidon(zeroArray);
        it('All zeros', () => {    
            expect(merkleTree.leaves).to.have.deep.members(zeroArray);
        });
        it('Number of leaves', () => {
            expect(merkleTree.leaves.length).to.equal(zeroArray.length);
        });
    });

    describe('Merkle Tree edge-cases', () => {
        it('generateProof(0)', async () => {
            testMerkleProofBit(merkleTree, 0);
        });
        it('generateProof(1)', async () => {
            testMerkleProofBit(merkleTree, 1);
        });
        it('generateProof(4)', async () => {
            testMerkleProofBit(merkleTree, 4);
        });
        it('generateProof(6)', async () => {
            testMerkleProofBit(merkleTree, 6);
        });
        it('generateProof(7)', async () => {
            testMerkleProofBit(merkleTree, merkleTree.leaves.length-1);
        });
        /*
        it('generateProof() - out of bound index', async () => {
            // MerkleTree.generateProof(position) throws a custom error
            testMerkleProofBit(merkleTree, merkleTree.leaves.length+1);
        });
        */
    });

});