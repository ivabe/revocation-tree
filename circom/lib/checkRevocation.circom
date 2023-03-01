include "./merkleproof.circom";
include "./modulo.circom";
include "./util.circom";

template CheckRevocation(depth) {
    signal input id;
    signal input lemma[depth + 2];
    signal input path[depth];

    signal output revocationRoot;
    revocationRoot <== lemma[0];

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

    signal leaf;
    signal position;
	leaf <== modulo.quotient;
	position <== modulo.reminder;

	component extractBit = extractKthBit(252);// capitalise the template name; 252 vs. 253?!
	extractBit.in <== leaf;
	extractBit.k <== position;

    signal output revoked;
	revoked <== extractBit.outBit;
}