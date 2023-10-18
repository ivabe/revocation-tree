include "./merkleproof.circom";
include "./modulo.circom";
include "./util.circom";
include "./circomlib/circuits/poseidon.circom";

template CheckRevocation(depth) {
    signal input id;
    signal input lemma[depth + 2];
    signal input path[depth];
	signal input revocationLeaf; 

    signal output revocationRoot;
    revocationRoot <== lemma[depth+1];

	// revocationLeaf must be include in the lemma/merkle proof
	component hasher = Poseidon(1);
	hasher.inputs[0] <== revocationLeaf;
	hasher.out === lemma[0];

	component merkleProof = MerkleProof(depth);
	merkleProof.lemma[0] <== lemma[0];
	merkleProof.lemma[depth + 1] <== lemma[depth + 1];
	for (var i=0; i<depth; i++) {
		merkleProof.path[i] <== path[i];
		merkleProof.lemma[i + 1] <== lemma[i + 1];
	}

	component modulo = Modulo();
	modulo.dividend <== id;
	modulo.modulus <== 252;

    signal position;
	position <== modulo.reminder;

	component extractBit = ExtractKthBit(252);// capitalise the template name; 252 vs. 253?!
	extractBit.in <== revocationLeaf; // leaf number 
	extractBit.k <== position;

    signal output revoked;
	revoked <== extractBit.outBit;
}