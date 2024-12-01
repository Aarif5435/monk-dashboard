import monk from "../assets/monk.svg";

export const Navbar = () => {
  return (
    <>
      <nav className="p-2 pl-4 border-b border-b-[#D1D1D1] flex gap-5">
        <img width={30} src={monk} alt="monk" />
        <h2 className="text-base pt-1 text-[#7E8185]">Monk Upsell & Cross-sell</h2>
      </nav>
    </>
  );
};
