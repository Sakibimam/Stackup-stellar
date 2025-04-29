'use client';

import { useEffect, useState } from 'react';
import { getPublicKey, connect, disconnect, signTransaction } from '../utils/wallet-connection';

export default function ConnectWrap() {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const showDisconnected = () => {
    setPublicKey(null);
  };

  const showConnected = async () => {
    const key = await getPublicKey();
    if (key) {
      setPublicKey(key);
    } else {
      showDisconnected();
    }
  };

  const handleConnect = async () => {
    await connect(showConnected);
  };

  const handleDisconnect = async () => {
    disconnect(showDisconnected);
  };

  useEffect(() => {
    (async () => {
      const key = await getPublicKey();
      key ? showConnected() : showDisconnected();
    })();
  }, []);

  return (
    <div id="connect-wrap" className="wrap" aria-live="polite">
      <div className="ellipsis" title={publicKey ?? ''}>
        {publicKey ? `Signed in as ${publicKey}` : '\u00A0'}
      </div>

      {!publicKey && (
        <button data-connect onClick={handleConnect} aria-controls="connect-wrap">
          Connect Wallet
        </button>
      )}

      {publicKey && (
        <button data-disconnect onClick={handleDisconnect} aria-controls="connect-wrap">
          Disconnect
        </button>
      )}

      <style jsx>{`
        .wrap {
          text-align: center;
          display: flex;
          width: 18em;
          margin: auto;
          justify-content: center;
          line-height: 2.7rem;
          gap: 0.5rem;
        }

        .ellipsis {
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
