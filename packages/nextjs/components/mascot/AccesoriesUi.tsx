import { useEffect, useState } from "react";
// import { NftExcludeFilters, Alchemy, Network } from "alchemy-sdk";
import { AccessoryCard } from "./AccesoryCard";
import { Alchemy, Network } from "alchemy-sdk";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const AccessoryUi = ({ name }: { name: string }) => {
  const [hatNfts, setHatNfts] = useState<any[]>([]);
  const [scarfNfts, setScarfNfts] = useState<any[]>([]);
  const settings = {
    apiKey: "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF", // Replace with your Alchemy
    network: Network.ETH_SEPOLIA,
  };
  const [nftLoading, setNftLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);

  const account = useAccount();
  const alchemy = new Alchemy(settings);
  const { data: hatContractData } = useDeployedContractInfo("Hat");
  const { data: scarfContractData } = useDeployedContractInfo("Scarf");
  const { data: mascotData } = useDeployedContractInfo("Mascot");
  const accountAddr = account.address as string;
  const hatAddr = hatContractData?.address as string;
  const scarfAddr = scarfContractData?.address as string;
  const mascotAddr = mascotData?.address as string;

  const getNfts = async () => {
    const hatNft = await alchemy.nft.getNftsForOwner(accountAddr, {
      contractAddresses: [hatAddr],
    });
    const scarfNft = await alchemy.nft.getNftsForOwner(accountAddr, {
      contractAddresses: [scarfAddr],
    });
    if (hatNft?.ownedNfts.length > 0) setHatNfts(hatNft?.ownedNfts);
    if (scarfNft?.ownedNfts.length > 0) setScarfNfts(scarfNft?.ownedNfts);
  };

  const { writeAsync: mintHatNft, isMining: hatMining } = useScaffoldContractWrite({
    contractName: "Hat",
    functionName: "mintItem",
    value: parseEther("0.002"),
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: mintScarfNft, isMining: scarfMining } = useScaffoldContractWrite({
    contractName: "Scarf",
    functionName: "mintItem",
    value: parseEther("0.002"),
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { data: hatBalance } = useScaffoldContractRead({
    contractName: "Hat",
    functionName: "balanceOf",
    args: [accountAddr],
  });

  const { data: scarfBalance } = useScaffoldContractRead({
    contractName: "Scarf",
    functionName: "balanceOf",
    args: [accountAddr],
  });

  useEffect(() => {
    setNftLoading(true);
    if (accountAddr && hatAddr && scarfAddr) getNfts();
    setNftLoading(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountAddr, hatMining, scarfMining, name, txLoading, hatBalance, scarfBalance]);

  return (
    <div>
      <div className="px-5 flex flex-col items-center">
        <h1 className="text-center mb-2">
          <span className="block text-3xl font-bold">Mint an Accessory</span>
        </h1>
        <p className="text-center text-lg flex flex-col">
          <span>Mint a {name === "Hat" ? "Hat" : "Scarf"} for your mascot at .002 ETH</span>
          <span> Select a {name === "Hat" ? "Hat" : "Scarf"} and upgrade your mascot </span>
        </p>
        <p className="text-center text-lg"></p>
        <button
          className="px-8 py-2 bg-base-300 rounded-full hover:bg-gray-400 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105"
          onClick={() => {
            name === "Hat" ? mintHatNft() : mintScarfNft();
          }}
        >
          Mint{" "}
        </button>
      </div>

      <div className="flex-grow border-t-2 w-full mt-16 md:px-24 px-8 py-12 h-full min-h-[22rem]">
        <div className="text-center mb-8">
          Your {name === "Hat" ? `Hats: ${Number(hatBalance)}` : `Scarfs: ${Number(scarfBalance)}`}
        </div>
        {nftLoading && (hatNfts.length == 0 || scarfNfts.length == 0) && (
          <div className="animate-pulse">
            {" "}
            <div className="w-full h-40 bg-base-200  text-center"></div>
          </div>
        )}
        {!nftLoading && (
          <div className="grid lg:grid-cols-5 grid-cols-4">
            {name === "Hat" &&
              hatNfts &&
              hatNfts.map(item => {
                return (
                  <div key={item.tokenId} className="mx-1">
                    <AccessoryCard
                      description={item?.description}
                      name={item?.name}
                      id={item?.tokenId}
                      accountAddr={accountAddr}
                      mascotAddr={mascotAddr}
                      accessoryName={name}
                      setTxLoading={setTxLoading}
                    />
                  </div>
                );
              })}
            {name === "Scarf" &&
              scarfNfts &&
              scarfNfts.map(item => {
                return (
                  <div key={item.tokenId} className="mx-1">
                    <AccessoryCard
                      description={item?.description}
                      name={item?.name}
                      id={item?.tokenId}
                      accountAddr={accountAddr}
                      mascotAddr={mascotAddr}
                      accessoryName={name}
                      setTxLoading={setTxLoading}
                    />
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
