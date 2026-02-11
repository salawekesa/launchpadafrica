/**
 * MetaMask / EIP-1193 wallet connection.
 * Uses window.ethereum (MetaMask or any compatible wallet).
 */

export interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function getEthereum(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  return window.ethereum ?? null;
}

export function isMetaMaskAvailable(): boolean {
  return !!getEthereum();
}

export interface ConnectResult {
  address?: string;
  error?: string;
}

/**
 * Request connection to MetaMask (or injected wallet).
 * Triggers the "Connect wallet" flow and returns the selected account address.
 */
export async function connectMetaMask(): Promise<ConnectResult> {
  const ethereum = getEthereum();
  if (!ethereum) {
    return {
      error: 'No wallet found. Install MetaMask or another Web3 wallet and refresh the page.',
    };
  }

  try {
    const accounts = (await ethereum.request({
      method: 'eth_requestAccounts',
      params: [],
    })) as string[];

    const address = accounts?.[0];
    if (!address || typeof address !== 'string') {
      return { error: 'No account selected.' };
    }

    return { address };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('User rejected') || message.includes('user rejected')) {
      return { error: 'Connection was rejected.' };
    }
    return { error: message || 'Failed to connect wallet.' };
  }
}

/**
 * Get the current account address without prompting (if already connected).
 */
export async function getWalletAddress(): Promise<string | null> {
  const ethereum = getEthereum();
  if (!ethereum) return null;

  try {
    const accounts = (await ethereum.request({
      method: 'eth_accounts',
      params: [],
    })) as string[];
    const address = accounts?.[0];
    return address && typeof address === 'string' ? address : null;
  } catch {
    return null;
  }
}
