import type React from "react";
import MingCuteMenuLine from "~icons/mingcute/menu-line";
import Dialog from "@comp/ui/Dialog/Dialog";
import { navMenu } from "@configs/navbar";

const NavbarMobile: React.FC = () => {
  return (
    <Dialog trigger={<MingCuteMenuLine className="size-8" />}>
      <div className="flex flex-col gap-4">
        {navMenu.map((nav) => (
          <section key={nav.text}>
            <a
              href={nav.link}
              className="modal-link text-heading inline-flex items-center gap-2 font-medium"
            >
              {nav.iconSvg && <nav.iconSvg className="size-6" />}
              {nav.text}
            </a>
            {nav.subMenu && nav.subMenu.length > 0 && (
              <ul className="my-2 grid grid-cols-2 gap-2">
                {nav.subMenu.map((child) => (
                  <li v-for="child in nav.subMenu" key={child.text}>
                    <a
                      href={child.link}
                      className="text-content p-4 pl-6 text-sm"
                    >
                      {child.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </Dialog>
  );
};

export default NavbarMobile;
