
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-50">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <span className="text-xl font-light text-black tracking-wide">CloudVault</span>
            </div>
            <Link href="/login">
              <Button className="bg-black hover:bg-gray-900 text-white rounded-full px-7 py-2 text-sm font-light transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-7xl md:text-8xl font-extralight text-black mb-12 leading-[0.85] tracking-tighter">
            Files,
            <br />
            <span className="text-gray-400">Everywhere.</span>
          </h1>
          <p className="text-lg text-gray-400 mb-16 max-w-lg mx-auto font-light leading-relaxed">
            Store and access your files from anywhere with effortless simplicity.
          </p>
          <Link href="/login">
            <Button className="bg-black hover:bg-gray-900 text-white rounded-full px-10 py-4 text-base font-light transition-all duration-300 hover:scale-105">
              Start now
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-20 text-center">
            <div>
              <div className="w-1 h-12 bg-black mx-auto mb-8"></div>
              <h3 className="text-lg font-light text-black mb-4 tracking-wide">Instant</h3>
              <p className="text-gray-400 font-light text-sm leading-relaxed">
                Upload and access files in milliseconds, not minutes.
              </p>
            </div>
            
            <div>
              <div className="w-1 h-12 bg-black mx-auto mb-8"></div>
              <h3 className="text-lg font-light text-black mb-4 tracking-wide">Private</h3>
              <p className="text-gray-400 font-light text-sm leading-relaxed">
                Your files are encrypted and visible only to you.
              </p>
            </div>
            
            <div>
              <div className="w-1 h-12 bg-black mx-auto mb-8"></div>
              <h3 className="text-lg font-light text-black mb-4 tracking-wide">Universal</h3>
              <p className="text-gray-400 font-light text-sm leading-relaxed">
                Available on every device you own, automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 border-t border-gray-50">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-extralight text-black mb-16 leading-tight tracking-tighter">
            Ready?
          </h2>
          <Link href="/login">
            <Button className="bg-black hover:bg-gray-900 text-white rounded-full px-10 py-4 text-base font-light transition-all duration-300 hover:scale-105">
              Get started for free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex justify-between items-center">
            <span className="text-sm font-light text-black tracking-wide">CloudVault</span>
            <div className="flex items-center space-x-12 text-xs text-gray-400 font-light">
              <a href="#" className="hover:text-black transition-colors duration-300">Privacy</a>
              <a href="#" className="hover:text-black transition-colors duration-300">Terms</a>
              <span>© 2025</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
