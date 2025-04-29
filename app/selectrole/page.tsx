'use client'
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex h-screen bg-[#C6D6D6] overflow-hidden">
      {/* Left side with chart graphic */}
  <div className="hidden  md:flex md:w-1/2 items-center justify-center  relative">
          <Image
            src="/Bg.svg"
            alt="Financial illustration with handshake and growth chart"
            width={500}
            height={500}
            priority
            className="z-10 bg-cover bg-center w-full h-full object-cover"
          />
          <div
            className="absolute bottom-0 left-0 right-0  bg-contain bg-bottom bg-no-repeat z-0"
            // style={{ backgroundImage: '/bg.svg' }}
          />
        </div>

      {/* Right side with content */}
      <div className="w-full md:w-2/3 bg-white rounded-l-[40px] flex items-center justify-center p-8">
        <div className="w-full max-w-lg space-y-8 items-center justify-center flex flex-col">
          <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold text-black text-center  leading-tight font-poppins">
            Connect Buyers and Sellers in the Deal Marketplace
          </h1>

          <p className="text-[#667085] text-lg text-center md:text-center font-poppins">
            Streamline your deal flow process with our platform. Connect with qualified buyers or find the perfect
            investment opportunity.
          </p>

          <div className="flex flex-col w-full max-w-md space-y- gap-4 pt-7  ">
            <Link
              href="#"
              className="bg-[#3aafa9] hover:bg-white  text-white hover:text-[#2a9d8f] hover:border-[#2a9d8f] border font-medium py-4 px-6 rounded-full text-center transition-colors"
            >
              Add a new deal and earn rewards
            </Link>
            <Link
              href="/register"
              className="border border-[#3aafa9] font-poppins text-[#3aafa9] hover:text-white hover:bg-[#3aafa9] font-medium py-4 px-6 rounded-full text-center transition-colors"
            >
              Fill out a buyer profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
