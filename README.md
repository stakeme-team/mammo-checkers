
# Prerequisites

Before starting, make sure that your machine has the following tools installed:

- **Node.js**
- **npm** (or pnpm, if you prefer)
- **Dojo** version **1.2.2**
- **Slot** version **0.34.0**

Additionally, you need to install the following components:

1. **Dojo Engine**
    
    ```bash
    curl -L https://install.dojoengine.org | bash
    dojoup
    ```
    
2. **Slot**  

    ```bash
    curl -L https://slot.cartridge.sh | bash
    slotup
    ```
    

---

# Quick Start

### 1. Preparing Katana via Slot (Terminal 1)

1. **Creating a slot for the project**
    
    First, create a slot by replacing `<YOUR_PROJECT_NAME>` with your project’s name (for example, mammo-checkers):
    
    ```
    slot d create <YOUR_PROJECT_NAME> katana
    ```
    
    This command will create a Katana slot for your project.
    
    > **Note:** If you wish to use verification through Celestia with blobs with **Saya**, you need to launch Katana differently:
    > `slot d create <YOUR_PROJECT_NAME> katana --provable --version 1.2.2 --chain-id <CHAIN_ID> --block-time 30000 --sequencing.block-max-cairo-steps 1600000`
    > 
    > Here:
    > - `--provable` enables Katana provable mode.
    > - `--version 1.2.2` sets the required version.
    > - `--chain-id <CHAIN_ID>` specifies the chain identifier.
    > - `--block-time 30000` sets the block time (in milliseconds).
    > - `--sequencing.block-max-cairo-steps 1600000` defines the maximum number of Cairo steps per block.
    
2. **Viewing Katana Logs**
    
    After creating the slot, retrieve the logs containing account information (addresses and private keys) by running:
    
    ```
    slot deployments logs <YOUR_PROJECT_NAME> katana -l 1000
    ```
    
    The `-l 1000` parameter indicates that 1000 lines of logs will be output.
    
3. **Forming the RPC URL**
    
    The RPC URL is formed according to the following scheme:
    
    ```
    https://api.cartridge.gg/x/<YOUR_PROJECT_NAME>/katana
    ```
    
    For example, if the project name is mammo-checkers, the URL will be:
    
    ```
    https://api.cartridge.gg/x/mammo-checkers/katana
    ```

### 2. Building and Migrating Smart Contracts (Terminal 2)

Before building and migrating, navigate to the directory with the contracts where the `dojo.toml` file is located, and edit it with the data obtained from the Katana logs.

1. **Navigating to the contracts directory**  
    Go to the `my_checkers` folder, where all the files for deploying smart contracts are located, including `dojo.toml`:
    
    ```bash
    cd my_checkers
    ```
    
2. **Editing the `dojo.toml` file**  
    Open the `dojo.toml` file and make changes in one of the profiles using the data obtained from the Katana logs (output of 1000 lines by the command:
    
    ```bash
    slot deployments logs <YOUR_PROJECT_NAME> katana -l 1000
    ```
    
    where at the beginning of the logs the deploy account data is displayed):
    
    - **[env]**
        - `rpc_url`: form it according to the scheme: `toml rpc_url = "https://api.cartridge.gg/x/<YOUR_PROJECT_NAME>/katana"` For example, for the _mammo-checkers_ project: `toml rpc_url = "https://api.cartridge.gg/x/mammo-checkers/katana"`
        - `account_address` and `private_key`: replace these with the values obtained from the logs (the initial lines where the account data for deployment are shown).
        - If a world address is available, you can update the `world_address` field.
    
    Example content of the `dojo.toml` file:
    
    ```toml
    [world]
    name = "Checkers"
    description = "The official Dojo Starter guide, the quickest and most streamlined way to get your Dojo Autonomous World up and running. This guide will assist you with the initial setup, from cloning the repository to deploying your world."
    cover_uri = "file://assets/cover.png"
    icon_uri = "file://assets/icon.png"
    website = "https://github.com/dojoengine/dojo-starter"
    seed = "my_checkers"
    
    [world.socials]
    x = "https://x.com/ohayo_dojo"
    discord = "https://discord.gg/FB2wR6uF"
    github = "https://github.com/dojoengine/dojo-starter"
    telegram = "https://t.me/dojoengine"
    
    [namespace]
    default = "my_checkers"
    
    [env]
    # RPC URL, formed according to the scheme:
    # https://api.cartridge.gg/x/<YOUR_PROJECT_NAME>/katana
    rpc_url = "https://api.cartridge.gg/x/mammo-checkers/katana"
    # Account data (seed = 0) from the Katana logs:
    account_address = "0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec"
    private_key = "0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912"
    # If you already have a world address, uncomment and update the following line:
    # world_address = "0x06171ed98331e849d6084bf2b3e3186a7ddf35574dd68cab4691053ee8ab69d7"
    
    [writers]
    "my_checkers" = ["my_checkers-queue_system", "my_checkers-actions"]
    ```
    
3. **Building the smart contracts**  
    After updating the `dojo.toml` file, execute the build of the smart contracts by replacing `<PROFILE>` with the desired profile (for example, `dev`):
    
    ```bash
    sozo build -P <PROFILE>
    ```
    
4. **Migration (deployment) of the smart contracts**  
    After a successful build, run the migration:
    
    ```bash
    sozo migrate -P <PROFILE>
    ```
    
    If the migration was successful, check the addresses of the deployed contracts:
    
    ```bash
    sozo inspect -P <PROFILE>
    ```
    
5. **Updating the environment file for the client**  
    Copy the addresses obtained from the `sozo inspect -P <PROFILE>` command and paste them into the `.env` file in the `client` directory for the client side to work correctly.
    

### 3. Running the Torii Indexer (Terminal 3)

After successfully migrating the smart contracts, you need to run the Torii indexer in a separate terminal. Follow these steps:

1. Retrieve the world contract address using the command:
    
    ```bash
    sozo inspect -P <PROFILE>
    ```
    
    In the output, find the address of the world contract (for example, `0x076e425a1ab823188c6b8cffd2092fd806a4c037f73171bda3b5c100c2823c5a`).
    
2. Run Torii by inserting the obtained address and the previously formed API URL. The command will look as follows:
    
    ```bash
    torii --world <WORLD_ADDRESS> --rpc https://api.cartridge.gg/x/<YOUR_PROJECT_NAME>/katana --http.cors_origins "*"
    ```
    
    Here:
    
    - `--world` specifies the world contract address.
    - `--rpc` takes the API URL, formed according to the scheme: `bash https://api.cartridge.gg/x/<YOUR_PROJECT_NAME>/katana` (in this example — `https://api.cartridge.gg/x/mammo-checkers/katana`).
    - `--http.cors_origins "*"` allows cross-origin requests.

---

# Project Structure and Key Features

The project is divided into two main parts: smart contracts and the client application. Below is a detailed description of each component.

---

### Smart Contracts (Directory: `my_checkers`)

The smart contracts are implemented using the Cairo language and Dojo. In our system, two main contracts are the focus, while the remaining files serve as libraries supporting these contracts.

#### Main Contracts

- **queue_system**  
    This contract handles queue management and matchmaking. Its key functions are:
    - **join_queue:** Allows a player to join the matchmaking queue for a selected game type (ClassicCheckers or CornerCheckers). If another player is already in the queue, a new match is automatically created.
    - **leave_queue:** Allows a player to exit the queue if they decide not to play. Upon leaving, a `QueueLeft` event is emitted.
- **actions**  
    This contract implements methods for processing moves and offering a draw:
    - **make_move:** Processes a regular move in a ClassicCheckers game. It validates the move, updates the match state, and emits a `MoveMade` event.
    - **corner_make_moves:** Designed for processing multiple moves in a CornerCheckers game, where one move can consist of several sequential movements.
    - **offer_draw:** Allows a player to propose a draw. If both players agree, the match status changes to "Draw," and a `DrawOffered` event is emitted.
#### Supporting Libraries and Files

- **Data Models:**  
    The model files (e.g., `board_piece.cairo`, `game_match.cairo`, `enums_cairo.cairo`, `match_id.cairo`) define the data structures used in the game:
    - **BoardPiece:** Contains information about each game piece (match ID, piece ID, coordinates, owner, and piece type).
    - **GameMatch:** Stores match details, including the match ID, players, game type, status, current turn, move count, and details about draw and winner conditions.
    - **MatchQueue:** Describes the matchmaking queue.
    - **MatchIDCounter:** Provides unique identifiers for new matches.
- **Game Logic:**  
    Files like `checkers_logic.cairo` and `init_board.cairo` include functions that implement:
    - **Move processing:** Functions such as `execute_classic_move` and `execute_corner_multi_moves` handle moving pieces, validating captures, promoting pieces to kings, and switching turns.
    - **Win or draw determination:** Functions like `check_winner_or_draw`, `check_classic_winner`, and `check_corner_winner` analyze the board state to determine the match outcome.
    - **Board initialization:** Functions `init_classic_board` and `init_corner_board` set up the initial configuration of pieces based on the selected game format.
#### Events
The smart contracts use events to notify the client side of significant changes in the game state:
- **MoveMade:** Emitted when a move is executed. It contains information about the match, the player, and the coordinates of the move (both starting and ending positions).
- **MatchCreated:** Emitted when a new match is created. It provides the match ID, addresses of both players, the match status, and the game type.
- **DrawOffered:** Indicates that a player has proposed a draw.

---

### Client Application (Directory: `client`)

The client application is built using React, Vite, and Apollo Client, providing an intuitive interface for interacting with the blockchain.
#### Key Components

- **ConnectWallet.tsx:**  
    This component manages wallet connections using libraries such as `@starknet-react/core` and `@cartridge/connector`. It allows users to connect and disconnect from the controller and displays the connected wallet address.
- **DrawButton.tsx:**  
    Provides functionality to offer a draw. It tracks the draw offer status via GraphQL queries and updates the interface accordingly, allowing the user to confirm or decline a draw.
- **PlayBtn.tsx (JoinQueue):**  
    Enables players to join the matchmaking queue by sending a transaction to the queue contract. Once confirmed, the component navigates the user to the game session.
- **WatchMatch.tsx:**  
    Subscribes to match state updates (e.g., changes in the current turn, match completion, draw offers) to update the user interface in real time.
- **StarknetProvider.tsx and Apollo Client Setup:**  
    The provider component sets up the connection to the Starknet network and configures Apollo Client for GraphQL communication, ensuring a smooth data exchange between the client and blockchain.

#### GraphQL and Subscriptions

The client application actively uses GraphQL to fetch real-time data regarding match states, queues, and game events. Query files (such as `checkQueueQuery.ts`, `checkPlayer1Matches.ts`, and `checkPlayer2Matches.ts`) and subscription components (such as `EventsSubscription.tsx`) enable the client to stay updated with the latest changes.

---
### Key Features

- **Decentralized Game Logic:**  
    All game logic, including move processing, win/draw conditions, matchmaking, and queue management, is implemented directly within smart contracts. This ensures transparency and reliable enforcement of game rules on the blockchain.
    
- **Interactive Client Application:**  
    The client is built with modern technologies (React, Apollo Client) and provides an intuitive interface for wallet management, joining queues, making moves, and receiving real-time updates.
    
- **Integration with Partner Technologies:**
    - **Dojo:** Used to develop smart contracts and store data in the World Contract.
    - **Slot:** Employed for rapid deployment of testing and production environments, allowing quick retrieval of configuration data.
    - **Cartridge:** Simplifies transaction confirmation and game session management, making blockchain interactions seamless and user-friendly.

This structure ensures a robust and scalable system, enabling a complete gaming experience with minimal delays and a highly intuitive interface for users.
# HTTPS for Controller Operation

For the controller to work correctly, you must use HTTPS. To do this, install `mkcert` and create a local certificate.

## 1. Installing mkcert

Follow the official guide for your operating system: [mkcert on GitHub](https://github.com/FiloSottile/mkcert).

### Windows:

```powershell
choco install mkcert
```

### macOS:

```bash
brew install mkcert
```

### Linux (Ubuntu/Debian):

```bash
sudo apt install libnss3-tools
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/
```

## 2. Installing the local root certificate

```bash
mkcert -install
```

## 3. Creating a certificate in the client directory

```bash
cd client
mkcert localhost
```

After this, the controller will work correctly using HTTPS.

---


# Using Celestia's Data Availability Layer

If you want your data to be verified and stored on Celestia, you need to run Saya – Dojo's proving service – which is responsible for generating cryptographic proofs and posting them as blobs to Celestia. Follow these steps:

1. **Run Katana in Provable Mode**  
    Ensure that Katana is running in provable mode (as described in the Quick Start section) to correctly generate blocks for subsequent verification.
    
2. **Obtain a Herodotus Dev Account with an API Key**  
    You can obtain the API key from [Herodotus Cloud](https://www.herodotus.cloud/).
    
3. **Clone the Saya Repository on Your Server**  
    Execute the following command:
    
    ```bash
    git clone git@github.com:dojoengine/saya.git
    ```
    
4. **Compile the Necessary Cairo Programs**  
    In the Saya repository, use the scripts provided to compile the required programs. Run:
    
    ```bash
    ./scripts/generate_snos.sh
    ```
    
    This script generates the SNOS program needed for Saya.
    
5. **Launch a Light Node for Celestia**  
    To interact with Celestia, you need to run a Celestia light node that will handle the retrieval and submission of data.
    
6. **Start Saya in Sovereign Mode**  
    Once all components are ready, start Saya with the necessary parameters:
    
    ```bash
    saya sovereign start --starknet-rpc https://api.cartridge.gg/x/<YOUR_PROJECT_NAME>/katana --snos-program ./programs/snos.json --atlantic-key <api-key> --celestia-rpc <url> --celestia-token <token> --genesis.first-block-number 0 local
    ```
    
    Here:
    
    - `--starknet-rpc` specifies the RPC URL for your project (e.g., `https://api.cartridge.gg/x/mammo-checkers/katana`).
    - `--snos-program` sets the path to the compiled SNOS program.
    - `--atlantic-key` should be replaced with your actual API key.
    - `--celestia-rpc` and `--celestia-token` are the RPC URL and token for accessing Celestia.
    - `--genesis.first-block-number 0` indicates the first block number 

Once Saya is running in sovereign mode, blocks will begin to be submitted to Celestia, ensuring that game states are provable using Celestia's data availability layer.
# Running the Client

After configuring the contract and updating the environment variables:

1. Navigate to the `client` directory.
2. Install dependencies:
    
    ```bash
    npm install
    ```
    
3. Run the client:
    
    ```bash
    npm run dev
    ```
    

Open your browser at [https://localhost:5173](https://localhost:5173) and enjoy the game!

> **Note:** If port `5173` is occupied or changed, npm will automatically display a new address in the console. Use it to access the application.

---

# Testing the Game

To test the interaction between multiple players, you can open a second player in incognito mode or in a different browser:

1. Open the first instance of the game in a normal browser window at [https://localhost:5173](https://localhost:5173).
2. For the second player, open a new incognito window (or use another browser) and navigate to the same address.
3. Now you can test the game as if it were running on different devices.

---

## Additional Recommendations

- **Running terminals in parallel:**  
    Ensure that all terminals (Katana, migration, client) are running in parallel for the environment to work correctly.
- **Logs and debugging:**  
    Use the command `slot deployments logs <PROJECT_NAME> katana -f` to view Katana logs in real time and for debugging.


Below is the revised section in English with the updated description for Slot:

---
# Using Dojo, Slot, and Cartridge for Implementing Game Logic

In our project, all game logic is implemented directly in smart contracts using Dojo and the Cairo language. This approach has enabled us to build a system that manages the game—from board initialization and move processing to matchmaking, queue handling, draw management, and determining the winner.
### Core System Components

- **Data Models:**
    - **BoardPiece:** Describes each game piece (its position, owner, and type).
    - **GameMatch:** Stores information about a game session, including the match ID, participants, game type (ClassicCheckers or CornerCheckers), status, current turn, move count, and details regarding draws and the winner.
    - **MatchQueue:** Implements the matchmaking queue, allowing players to join and initiate a game.
    - **MatchIDCounter:** Ensures unique identifiers for each new match.
- **Game Event Handling:**  
    Smart contract functions (such as `make_move`, `corner_make_moves`, and `offer_draw`) handle:
    - Validating moves (e.g., checking for valid captures and adherence to diagonal movement rules).
    - Emitting events to notify the client side of moves made.
    - Updating game state, switching turns, and checking win or draw conditions.
- **Board Initialization:**  
    Functions like `init_classic_board` and `init_corner_board` set up the initial arrangement of pieces according to the rules of the selected game format.
- **Matchmaking Queue:**  
    The queue module implements mechanisms for joining and leaving the queue. Once two players are present in the queue, a new match is automatically created and the game session begins.
# Documentation on the Use of Partner Technologies

In our project, we integrated a set of tools that enable the implementation of a fully decentralized game, where all logic and data storage are executed within smart contracts. Below is a detailed description of how we leveraged key technologies:
### Dojo

We use **Dojo** for developing smart contracts in the Cairo language. Thanks to Dojo, we can:
- **Define models and store data in the World Contract.**  
    All essential game data (such as moves, match states, and player queues) are stored in a dedicated “world contract.” Using Dojo, we declare models like `BoardPiece`, `GameMatch`, `MatchQueue`, and `MatchIDCounter`, which are responsible for:
    - **BoardPiece:** Holds information about each game piece (its position, owner, and type).
    - **GameMatch:** Contains details about each match—including the match ID, participants, game type (ClassicCheckers or CornerCheckers), status, current turn, move count, as well as draw and winner information.
    - **MatchQueue:** Manages the matchmaking queue, allowing players to join and automatically initiating a match once a second player is present.
    - **MatchIDCounter:** Ensures the generation of unique identifiers for new matches.
- **Handle game events.**  
    Using Dojo, we implemented functions to process moves (such as `make_move` and `corner_make_moves`), confirm moves, and propose draws (`offer_draw`), along with emitting corresponding events (`MoveMade`, `MatchCreated`, `DrawOffered`). This allows us to:
    - Validate moves (e.g., check for valid captures and adherence to diagonal movement rules).
    - Update the game state, switch turns, and verify win or draw conditions.
    - Inform the client side of each significant event by emitting events.
- **Initialize the board.**  
    Functions like `init_classic_board` and `init_corner_board` set up the initial arrangement of pieces according to the rules of the selected game format, ensuring a proper start for each match.
### Slot

**Slot** is a tool provided by Cartridge.gg that we use for rapidly deploying instances of Katana (a testing environment) and Torii (an indexer). With Slot, we can:

- Create deployment slots for our smart contracts using the command:
    `slot d create <YOUR_PROJECT_NAME> katana`
- Retrieve necessary configuration data (account addresses and private keys) from the logs with:
    `slot deployments logs <YOUR_PROJECT_NAME> katana -l 1000`
    This data is then used to populate the `dojo.toml` file, which specifies where to send transactions and how to interact with the World Contract.
### Cartridge

We integrated **Cartridge** to efficiently manage game sessions. Thanks to Cartridge:
- **The transaction confirmation process is simplified.**  
    When a player confirms the start of a game, Cartridge automatically authorizes the transaction. This eliminates the need to manually sign every operation, significantly streamlining blockchain interactions.
- **Games can start quickly.**  
    Players can immediately begin playing without additional authorization steps, as Cartridge handles transaction confirmations, making the game process intuitive and convenient.
- **Blockchain interaction becomes more user-friendly.**  
    The automation of transactions allows us to focus on the game itself, minimizing delays and enhancing the overall user experience.
### Saya

We used **Saya** — Dojo’s proving service — specifically to send blobs to Celestia and ensure that game states are verifiable using Celestia's data availability layer. To achieve this, Saya performs the following functions:

- **Block Retrieval and Proof Generation:**  
    Saya continuously polls the Katana sequencer to retrieve the produced blocks and computes cryptographic proofs (using STARK technology) for each block and its state updates. This ensures that every transaction and game state change is verified.
- **Sending Proofs as Blobs to Celestia:**  
    The generated proofs are packaged into blobs that include essential metadata (such as 
    headers with previous state roots, commitments, and block heights). These blobs are then sent to Celestia, enabling the data to be stored and verified in a decentralized data availability layer.
- **Proof Aggregation:**  
    To improve efficiency, Saya aggregates several block state transitions into a single proof. This reduces the overhead associated with proof generation and storage while maintaining the integrity and verifiability of all actions.

---