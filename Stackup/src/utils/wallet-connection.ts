'use client';

import { ethers } from 'ethers';

const SELECTED_WALLET_ID = "selectedWalletId";

export async function getPublicKey() {
  // Check if Ethereum object exists (Freighter/MetaMask)
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Return the first account
      return accounts[0] ? ethers.utils.getAddress(accounts[0]) : null;
    } catch (error) {
      console.error("Failed to get public key:", error);
      return null;
    }
  }
  return null;
}

export async function connect(callback?: () => Promise<void>) {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        // Store the selected wallet
        localStorage.setItem(SELECTED_WALLET_ID, 'freighter');
        
        // Call callback if provided
        if (callback) await callback();
        
        return accounts[0];
      }
    } catch (error) {
      console.error("Connection failed:", error);
    }
  } else {
    alert('Please install MetaMask/Freighter wallet!');
  }
  return null;
}

export async function disconnect(callback?: () => Promise<void>) {
  // Remove stored wallet
  localStorage.removeItem(SELECTED_WALLET_ID);
  
  // Call callback if provided
  if (callback) await callback();
}

export async function signTransaction(transaction: any) {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // This is a placeholder. In a real app, you'd use ethers.js or web3.js 
      // to sign the transaction with the connected wallet
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      return await signer.signTransaction(transaction);
    } catch (error) {
      console.error("Transaction signing failed:", error);
      return null;
    }
  }
  return null;
}
