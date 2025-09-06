let playInstance = null;

export async function initPlay(endpoint = "https://api.devnet.solana.com") {
    // Create Play instance with Solana endpoint
    playInstance = new window.Play({ connection: endpoint });
    console.log("Play SDK initialized with endpoint:", endpoint);
    return true;
}

export async function mintNFT(walletAddress, metadata) {
    if (!playInstance) throw new Error("Play SDK not initialized");

    const nft = await playInstance.nft.mint({
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,   // e.g. Arweave/IPFS metadata link
        owner: walletAddress
    });

    console.log("NFT minted:", nft);
    return nft;
}

export async function transferToken(fromAddress, toAddress, amount) {
    if (!playInstance) throw new Error("Play SDK not initialized");

    const tx = await playInstance.token.transfer({
        from: fromAddress,
        to: toAddress,
        amount
    });

    console.log("Token transfer tx:", tx);
    return tx;
}
