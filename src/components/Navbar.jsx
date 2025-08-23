"use client";
import { AiOutlineMail, AiOutlineMenuFold } from "react-icons/ai";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="bg-transparent mt-10 border-gray-600 border rounded-3xl md:w-1/2 sm:w-7/10 m-auto p-4">
        <ul className="flex justify-between items-center">
          <div className="flex gap-2 *:text-2xl pl-2">
            <li>
              <a
                href={"mailto:jh.consuegra75@gmail.com"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <AiOutlineMail className="text-gray-300" />
              </a>
            </li>
            <li>
              <a
                href={"https://github.com/JDanielHConsuegra"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub className="text-gray-300" />
              </a>
            </li>
            <li>
              <a
                href={
                  "https://www.linkedin.com/in/juan-daniel-hern%C3%A1ndez-18335a335/?locale=es_ES"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin className="text-gray-300" />
              </a>
            </li>
          </div>

          {/* IZQUIERDA: LINKS (solo escritorio) */}
          <div className="hidden *:p-2 *:pr-5 *:pl-5 *:rounded-3xl *:hover:bg-gray-600/30 *:cursor-pointer *:transition-all *:duration-300 md:flex gap-1 pl-4">
            <li>
              <a href="/#home" className="text-gray-300  font-bold">
                Home
              </a>
            </li>
            <li>
              <a href="/#experience" className="text-gray-300  font-bold">
                Experience
              </a>
            </li>
            <li>
              <a href="/#projects" className="text-gray-300  font-bold">
                Projects
              </a>
            </li>
            <li>
              <a href="/#about" className="text-gray-300  font-bold">
                About Me
              </a>
            </li>
          </div>

          {/* DERECHA: Botón menú (solo móvil) */}
          <li className="md:hidden pr-2">
            <AiOutlineMenuFold
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 cursor-pointer text-2xl"
            />
          </li>
        </ul>
      </nav>

      {/* MENÚ DESPLEGABLE SOLO EN MÓVIL */}
      <div
        className={`fixed border-gray-600 border top-0 left-0 h-full w-45 bg-black/70 z-50 flex flex-col justify-center items-center
        transition-transform duration-1000 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
      >
        <ul className="flex flex-col gap-6 justify-center items-center *:pr-8 *:pl-8 *:p-3 *:text-center *:font-semibold *:rounded-3xl *:hover:bg-gray-500/40 *:transition-colors *:duration-300 *:cursor-pointer">
          <li>
            <a href="/#home" className="text-gray-300 ">
              Home
            </a>
          </li>
          <li>
            <a href="/#experience" className="text-gray-300 ">
              Experience
            </a>
          </li>
          <li>
            <a href="/#projects" className="text-gray-300 ">
              Projects
            </a>
          </li>
          <li>
            <a href="/#about" className="text-gray-300 ">
              About Me
            </a>
          </li>
          <li className="border-gray-600 border">
            <button
              className="text-gray-300 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              Cerrar
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
