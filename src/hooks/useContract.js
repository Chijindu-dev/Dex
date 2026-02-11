// src/hooks/useContract.js
import { useMemo, useContext } from 'react';
import { Contract } from 'ethers';
import { Web3Context } from '../context/Web3Context';

const CONTRACTS = {
  ROUTER: 'DexRouter',
  FACTORY: 'DexFactory',
  PAIR: 'DexPair',
};

export function useContract(contractAddress, abi, contractName) {
  const { signer, provider } = useContext(Web3Context);

  return useMemo(() => {
    if (!contractAddress || !abi) return null;

    const signerOrProvider = signer || provider;
    if (!signerOrProvider) return null;

    try {
      return new Contract(contractAddress, abi, signerOrProvider);
    } catch (error) {
      console.error(`Error creating contract ${contractName}:`, error);
      return null;
    }
  }, [contractAddress, abi, signer, provider, contractName]);
}
