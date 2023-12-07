import { useState } from "react";
import type { NextPage } from "next";
import { AccessoryUi } from "~~/components/mascot/AccesoriesUi";

interface AccessoryProps {
  name: string;
  icon: string | JSX.Element;
}
const accessories: AccessoryProps[] = [
  {
    name: "Hat",
    icon: "🎩",
  },
  {
    name: "Scarf",
    icon: "🧣",
  },
];

const Accessories: NextPage = () => {
  const [selectedAccessory, setSelectedAccessory] = useState<AccessoryProps>(accessories[0]);
  return (
    <>
      {" "}
      <div className="flex flex-row justify-center mx-auto gap-2 w-full max-w-7xl py-4 px-6 lg:px-10 flex-wrap">
        {accessories.map(accessory => (
          <button
            className={`btn btn-secondary btn-sm normal-case font-thin ${
              accessory.name === selectedAccessory.name ? "bg-base-300" : "bg-base-100"
            }`}
            key={accessory.name}
            onClick={() => setSelectedAccessory(accessory)}
          >
            {accessory.name}
          </button>
        ))}
      </div>
      <AccessoryUi name={selectedAccessory.name} icon={selectedAccessory.icon} />
    </>
  );
};

export default Accessories;
