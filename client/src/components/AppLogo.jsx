import { NavLink } from "react-router-dom";
import OpenCanvasIcon from "./CustomIcons/OpenCanvas";

export default function AppLogo({
  size = 32,
  fontSize = "text-xl md:text-2xl",
}) {
  return (
    <NavLink
      to="/"
      className={`${fontSize} font-thin text-stone-950 rounded-md box-content px-1 md:px-1 py-0 flex justify-center gap-2 items-center tracking-wide`}
    >
      <OpenCanvasIcon size={size} color="currentColor" strokeWidth={2} />
      <span className="font-['Six_Caps'] text-black dark:text-white">
        opencanvas
      </span>
    </NavLink>
  );
}
