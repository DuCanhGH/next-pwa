import Image from "next/image";

const Page = () => (
  <div>
    <p id="welcome-text">This is a Next.js PWA!</p>
    <Image
      src="/next.svg"
      alt="Next.js Logo"
      width={180}
      height={37}
      priority
    />
  </div>
);

export default Page;
