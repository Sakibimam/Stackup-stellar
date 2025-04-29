import { StackGame, connectWalletAndGetPublicKey } from "./models/StackGame";
import { getElements } from "./helpers/getElements";

// Hardcoded wallet public key
var WALLET_PUBLIC_KEY = "";

// Wallet balance (for more realism)
const WALLET_BALANCE = "245.38";
const WALLET_CURRENCY = "SOL";

let stackGameInstance: StackGame | null = null;
let isWalletConnected = false;
let notificationTimeout: number | null = null;

export const onInit = () => {
  const { canvas, playButton, connectWalletBtn } = getElements();

  if (!canvas) {
    console.error("Canvas element is not found.");
    return;
  }

  // Initialize the StackGame
  stackGameInstance = new StackGame(canvas);

  // Add event listener for play button
  playButton?.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent the event from affecting the game
    if (stackGameInstance) {
      stackGameInstance.onGameStart();
    }
  });

  // Update UI to reflect initial wallet connection state
  updateWalletUI();

  // Add event listener for connect wallet button
  if (connectWalletBtn) {
    // Remove the inline onclick attribute if it exists
    connectWalletBtn.removeAttribute("onclick");
    // Add proper event listener
    connectWalletBtn.addEventListener("click", toggleWalletConnection);
  } else {
    console.error("Connect wallet button not found");
  }
};

// Toggle wallet connection on button click
const toggleWalletConnection = (e: Event) => {
  e.stopPropagation(); // prevent the event from affecting the game
  
  const connectWalletBtn = getElements().connectWalletBtn;
  
  // Add click animation
  if (connectWalletBtn) {
    // Add animation class
    connectWalletBtn.classList.add("wallet-btn-click");
    
    // Remove the animation class after animation completes
    setTimeout(() => {
      connectWalletBtn.classList.remove("wallet-btn-click");
      
      // Process wallet connection/disconnection after animation
      if (isWalletConnected) {
        disconnectWallet();
      } else {
        connectWallet();
      }
    }, 300); // Match this with your CSS animation duration
  }
};

// Function to connect wallet
const connectWallet = async () => {
  console.log("Connecting wallet...");
  
  // Simulate a loading state for more realism (optional)
  const connectWalletBtn = getElements().connectWalletBtn;
  if (connectWalletBtn) {
    connectWalletBtn.textContent = "Connecting...";
    connectWalletBtn.disabled = true;
  }

  WALLET_PUBLIC_KEY = await connectWalletAndGetPublicKey();
  // return
  
  // Simulate network delay for realism
  setTimeout(() => {
    // Simulate wallet connection with the hardcoded public key
    isWalletConnected = true;
    console.log(`Wallet connected: ${WALLET_PUBLIC_KEY}`);
    
    // Pass the public key to the game if needed
    if (stackGameInstance) {
      // Uncomment and implement this method in your StackGame class if needed
      // stackGameInstance.setWalletPublicKey(WALLET_PUBLIC_KEY);
    }
    
    // Show a notification to user
    showNotification("Wallet connected successfully!");
    
    // Update UI elements
    updateWalletUI();
    
    // Re-enable button
    if (connectWalletBtn) {
      connectWalletBtn.disabled = false;
    }
  }, 800); // Simulate a short network delay
};

// Function to disconnect wallet
const disconnectWallet = () => {
  console.log("Disconnecting wallet...");
  
  // Simulate a loading state
  const connectWalletBtn = getElements().connectWalletBtn;
  if (connectWalletBtn) {
    connectWalletBtn.textContent = "Disconnecting...";
    connectWalletBtn.disabled = true;
  }
  
  // Simulate slight delay for realism
  setTimeout(() => {
    isWalletConnected = false;
    
    // Update any game state if needed
    if (stackGameInstance) {
      // Uncomment and implement this method in your StackGame class if needed
      // stackGameInstance.clearWalletConnection();
    }
    
    // Show notification
    showNotification("Wallet disconnected");
    
    // Update UI elements
    updateWalletUI();
    
    // Re-enable button
    if (connectWalletBtn) {
      connectWalletBtn.disabled = false;
    }
  }, 500);
};

// Update UI elements based on wallet connection state
const updateWalletUI = () => {
  const connectWalletBtn = getElements().connectWalletBtn;
  const walletDisplay = document.getElementById('walletDisplay');
  
  if (connectWalletBtn) {
    if (isWalletConnected) {
      connectWalletBtn.textContent = "Disconnect Wallet";
      connectWalletBtn.classList.add("connected");
      
      // Show a truncated version of the public key
      const displayAddress = `${WALLET_PUBLIC_KEY.substring(0, 4)}...${WALLET_PUBLIC_KEY.substring(WALLET_PUBLIC_KEY.length - 4)}`;
      
      // Update wallet address display
      if (walletDisplay) {
        walletDisplay.textContent = displayAddress;
        walletDisplay.style.display = "flex"; // Show with flex to align indicator
        
        // Add click event to show wallet details
        if (!walletDisplay.hasAttribute('listener-added')) {
          walletDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            showWalletDetails();
          });
          walletDisplay.setAttribute('listener-added', 'true');
          walletDisplay.style.cursor = 'pointer';
          walletDisplay.title = 'Click to view wallet details';
        }
      }
      
      // Enable game features that require wallet connection
      if (stackGameInstance) {
        // Uncomment and implement this method in your StackGame class if needed
        // stackGameInstance.enableWalletFeatures();
      }
    } else {
      connectWalletBtn.textContent = "Connect Wallet";
      connectWalletBtn.classList.remove("connected");
      
      // Hide wallet display
      if (walletDisplay) {
        walletDisplay.style.display = "none";
      }
      
      // Remove any wallet details popup if present
      const popup = document.getElementById('wallet-details-popup');
      if (popup && popup.parentNode) {
        document.body.removeChild(popup);
      }
      
      // Disable game features that require wallet connection
      if (stackGameInstance) {
        // Uncomment and implement this method in your StackGame class if needed
        // stackGameInstance.disableWalletFeatures();
      }
    }
  }
};

// Show notification to the user
const showNotification = (message: string) => {
  // Remove any existing notification
  const existingNotification = document.getElementById('wallet-notification');
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }
  
  // Clear any existing timeout
  if (notificationTimeout !== null) {
    window.clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'wallet-notification';
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = '#2ecc71';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '1000';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  notificationTimeout = window.setTimeout(() => {
    if (notification.parentNode) {
      document.body.removeChild(notification);
    }
    notificationTimeout = null;
  }, 3000);
};

// Show wallet details in a popup
const showWalletDetails = () => {
  // Only show if wallet is connected
  if (!isWalletConnected) return;
  
  // Remove any existing popup
  const existingPopup = document.getElementById('wallet-details-popup');
  if (existingPopup) {
    document.body.removeChild(existingPopup);
    return; // Toggle off if already showing
  }
  
  // Create popup element
  const popup = document.createElement('div');
  popup.id = 'wallet-details-popup';
  popup.style.position = 'absolute';
  popup.style.top = '70px';
  popup.style.right = '20px';
  popup.style.backgroundColor = '#fff';
  popup.style.borderRadius = '8px';
  popup.style.padding = '15px';
  popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  popup.style.zIndex = '1000';
  popup.style.minWidth = '240px';
  popup.style.color = '#333';
  
  // Add content
  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <strong>Wallet Details</strong>
      <button id="close-wallet-popup" style="background: none; border: none; cursor: pointer; font-size: 16px;">&times;</button>
    </div>
    <div style="margin-bottom: 8px;">
      <div style="color: #888; font-size: 12px;">Address</div>
      <div style="font-family: monospace; font-size: 12px; word-break: break-all;">${WALLET_PUBLIC_KEY}</div>
    </div>
    <div style="margin-bottom: 8px;">
      <div style="color: #888; font-size: 12px;">Balance</div>
      <div style="font-size: 18px; font-weight: bold;">${WALLET_BALANCE} ${WALLET_CURRENCY}</div>
    </div>
    <button id="copy-address-btn" style="width: 100%; padding: 8px; background-color: #f3f3f3; border: none; border-radius: 4px; margin-top: 10px; cursor: pointer;">
      Copy Address
    </button>
  `;
  
  // Add to DOM
  document.body.appendChild(popup);
  
  // Add event listeners
  document.getElementById('close-wallet-popup')?.addEventListener('click', () => {
    if (popup.parentNode) {
      document.body.removeChild(popup);
    }
  });
  
  document.getElementById('copy-address-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(WALLET_PUBLIC_KEY).then(() => {
      document.getElementById('copy-address-btn')!.textContent = 'Copied!';
      setTimeout(() => {
        const btn = document.getElementById('copy-address-btn');
        if (btn) btn.textContent = 'Copy Address';
      }, 2000);
    });
  });
  
  // Close if clicked outside
  document.addEventListener('click', (e) => {
    if (popup.parentNode && !popup.contains(e.target as Node) && 
        e.target !== document.getElementById('walletDisplay')) {
      document.body.removeChild(popup);
    }
  }, { once: true });
};

// Wait for DOM
document.addEventListener("DOMContentLoaded", onInit);