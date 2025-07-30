window.walletInterop = {
    connectPhantom: async function () {
        if (window.solana && window.solana.isPhantom) {
            try {
                const resp = await window.solana.connect();
                return resp.publicKey.toString();
            } catch (err) {
                console.error("Phantom connection failed:", err);
                return null;
            }
        }
        alert("Phantom Wallet not found.");
        return null;
    },

    disconnectPhantom: async function () {
        if (window.solana && window.solana.isPhantom) {
            try {
                await window.solana.disconnect();
                return true;
            } catch (err) {
                console.error("Phantom disconnect failed:", err);
                return false;
            }
        }
        return false;
    },

    connectMetaMask: async function () {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                return accounts[0];
            } catch (err) {
                console.error("MetaMask connection failed:", err);
                return null;
            }
        }
        alert("MetaMask not found.");
        return null;
    },

    sendSol: async function (toAddress, amountInSol) {
        try {
            if (!window.solana || !window.solana.isPhantom) {
                alert("Phantom Wallet not found.");
                return null;
            }

            const connection = new solanaWeb3.Connection(
                solanaWeb3.clusterApiUrl("devnet"), //solanaWeb3.clusterApiUrl("mainnet-beta"),
                "confirmed"
            );

            const fromPubKey = window.solana.publicKey;
            const toPubKey = new solanaWeb3.PublicKey(toAddress);

            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: fromPubKey,
                    toPubkey: toPubKey,
                    lamports: amountInSol * solanaWeb3.LAMPORTS_PER_SOL
                })
            );

            transaction.feePayer = fromPubKey;
            const latestBlockhash = await connection.getLatestBlockhash();
            transaction.recentBlockhash = latestBlockhash.blockhash;

            const signedTx = await window.solana.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTx.serialize());
            await connection.confirmTransaction(signature);

            return signature;
        } catch (err) {
            console.error("Failed to send SOL:", err);
            return null;
        }
    }
};
