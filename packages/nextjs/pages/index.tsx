import { useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { NftCard } from "~~/components/mascot/NftCard";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [nfts, setNfts] = useState<any[]>([]);
  const settings = {
    apiKey: "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",
    network: Network.ETH_SEPOLIA,
  };
  const [nftLoading, setNftLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);

  const account = useAccount();
  const alchemy = new Alchemy(settings);
  const { data: deployedContractData } = useDeployedContractInfo("Mascot");
  const accountAddr = account.address as string;
  const contractAddr = deployedContractData?.address as string;

  const getNfts = async () => {
    const nft = await alchemy.nft.getNftsForOwner(accountAddr, {
      contractAddresses: [contractAddr],
    });
    if (nft?.ownedNfts.length > 0) setNfts(nft?.ownedNfts);
    console.log(nft.ownedNfts);
  };

  const { writeAsync: mintNft, isMining } = useScaffoldContractWrite({
    contractName: "Mascot",
    functionName: "mintItem",
    value: parseEther("0.005"),
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { data: balance } = useScaffoldContractRead({
    contractName: "Mascot",
    functionName: "balanceOf",
    args: [accountAddr],
  });

  useEffect(() => {
    setNftLoading(true);

    if (accountAddr && contractAddr) getNfts();
    setNftLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountAddr, isMining, txLoading, balance]);

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 flex flex-col items-center">
          <h1 className="text-center ">
            <span className="block text-3xl font-bold">Mascots</span>
          </h1>
          <h1 className="text-center">
            {" "}
            It is jolly season. When is a better time than now to add penguins to your igloo!
          </h1>
          <h1 className="text-center text-lg">
            Mint yourself a unique Mascot at .005 ETH, add some accesories and add penguin to your igloo.
          </h1>

          <button
            className="px-8 py-2 bg-base-300 rounded-full hover:bg-gray-500 transition ease-in-out delay-150 hover:-translate-y-0.5 hover:scale-105"
            onClick={() => mintNft()}
          >
            Mint{" "}
          </button>
        </div>

        <div className={"flex-grow border-t-2 w-full mt-16 md:px-24 px-8 py-12 "}>
          <div className="text-center mb-8">Your Mascots: {Number(balance)}</div>
          {nftLoading && nfts.length == 0 && (
            <div className="animate-pulse">
              {" "}
              <div className="w-full h-40 bg-base-200  text-center"></div>
            </div>
          )}
          {!nftLoading && nfts && (
            <div className="grid md:grid-cols-5 grid-cols-4 h-full">
              {nfts.map(item => {
                console.log(item);
                return (
                  <div key={item.tokenId} className="mx-1">
                    <NftCard
                      description={item?.description}
                      name={item?.name}
                      id={item?.tokenId}
                      setTxLoading={setTxLoading}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
