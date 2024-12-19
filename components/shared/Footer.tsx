import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t py-8">
      <div className="wrapper flex flex-col gap-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col items-center sm:items-start">
          <Link href={"/"}>
            <Image
              src={"/assets/images/logo.svg"}
              alt="logo"
              width={138}
              height={38}
            />
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            © {new Date().getFullYear()} Event Hive. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <h4 className="font-semibold">Quick Links</h4>
          <ul className="mt-2 space-y-2">
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms of Service</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <h4 className="font-semibold">Follow Us</h4>
          <div className="mt-2 flex space-x-4">
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/assets/images/facebook.svg"
                alt="Facebook"
                width={24}
                height={24}
              />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/assets/images/twitter.svg"
                alt="Twitter"
                width={24}
                height={24}
              />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/assets/images/linkedin.svg"
                alt="LinkedIn"
                width={24}
                height={24}
              />
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <h4 className="font-semibold">Contact Us</h4>
          <p className="mt-2 text-sm text-gray-500">
            123 Event Street
            <br />
            City, State, 12345
            <br />
            Email: contact@eventhive.com
            <br />
            Phone: (123) 456-7890
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
